import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

type QuoteItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder?: number;
};

type CreateQuoteInput = {
  customerId: string;
  title: string;
  description?: string | null;
  discount?: number;
  validUntil?: string | null;
  notes?: string | null;
  terms?: string | null;
  items: QuoteItemInput[];
};

type UpdateQuoteInput = {
  customerId?: string;
  title?: string;
  description?: string | null;
  discount?: number;
  validUntil?: string | null;
  notes?: string | null;
  terms?: string | null;
  items?: QuoteItemInput[];
};

type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELED";

function calculateItems(items: QuoteItemInput[]) {
  let subtotal = 0;

  const calculatedItems = items.map((item, index) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    const total = Number(
      (quantity * unitPrice).toFixed(2)
    );

    subtotal += total;

    return {
      description: item.description,
      quantity: quantity.toString(),
      unitPrice: unitPrice.toFixed(2),
      total: total.toFixed(2),
      sortOrder: item.sortOrder ?? index,
    };
  });

  return {
    items: calculatedItems,
    subtotal: Number(subtotal.toFixed(2)),
  };
}

function calculateTotal(
  subtotal: number,
  discount: number
) {
  const safeDiscount = Math.max(
    0,
    Number(discount || 0)
  );

  return Math.max(
    0,
    Number((subtotal - safeDiscount).toFixed(2))
  );
}

async function customerBelongsToOrganization(
  customerId: string,
  organizationId: string
) {
  return prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });
}

async function generateQuoteNumber(
  organizationId: string
) {
  const year = new Date().getFullYear();
  const prefix = `ORC-${year}-`;

  const lastQuote = await prisma.quote.findFirst({
    where: {
      organizationId,
      number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      number: "desc",
    },
    select: {
      number: true,
    },
  });

  let sequence = 1;

  if (lastQuote) {
    const lastSequence = Number(
      lastQuote.number.split("-").pop()
    );

    if (Number.isFinite(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(
    4,
    "0"
  )}`;
}

export async function createQuote(
  organizationId: string,
  input: CreateQuoteInput
) {
  const customer =
    await customerBelongsToOrganization(
      input.customerId,
      organizationId
    );

  if (!customer) {
    return {
      error: "CUSTOMER_NOT_FOUND" as const,
    };
  }

  const calculated = calculateItems(input.items);

  const discount = Number(input.discount ?? 0);

  const total = calculateTotal(
    calculated.subtotal,
    discount
  );

  for (let attempt = 0; attempt < 5; attempt++) {
    const number =
      await generateQuoteNumber(
        organizationId
      );

    try {
      const quote = await prisma.quote.create({
        data: {
          organizationId,
          customerId: input.customerId,

          number,
          title: input.title,
          description: input.description ?? null,

          subtotal:
            calculated.subtotal.toFixed(2),

          discount:
            discount.toFixed(2),

          total:
            total.toFixed(2),

          validUntil: input.validUntil
            ? new Date(input.validUntil)
            : null,

          notes: input.notes ?? null,
          terms: input.terms ?? null,

          items: {
            create: calculated.items,
          },
        },

        include: {
          customer: true,
          items: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

      return {
        quote,
      };
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Não foi possível gerar a numeração do orçamento."
  );
}

export async function listQuotes(
  organizationId: string,
  filters?: {
    search?: string;
    status?: QuoteStatus;
    customerId?: string;
  }
) {
  const search = filters?.search?.trim();

  return prisma.quote.findMany({
    where: {
      organizationId,
      deletedAt: null,

      status: filters?.status,

      customerId: filters?.customerId,

      ...(search
        ? {
            OR: [
              {
                number: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                customer: {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    },

    include: {
      customer: {
        select: {
          id: true,
          name: true,
          type: true,
          phone: true,
          whatsapp: true,
        },
      },

      items: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getQuoteById(
  id: string,
  organizationId: string
) {
  return prisma.quote.findFirst({
    where: {
      id,
      organizationId,
      deletedAt: null,
    },

    include: {
      customer: true,

      items: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
}

export async function updateQuote(
  id: string,
  organizationId: string,
  input: UpdateQuoteInput
) {
  const existing = await prisma.quote.findFirst({
    where: {
      id,
      organizationId,
      deletedAt: null,
    },

    include: {
      items: true,
    },
  });

  if (!existing) {
    return {
      error: "QUOTE_NOT_FOUND" as const,
    };
  }

  const customerId =
    input.customerId ?? existing.customerId;

  const customer =
    await customerBelongsToOrganization(
      customerId,
      organizationId
    );

  if (!customer) {
    return {
      error: "CUSTOMER_NOT_FOUND" as const,
    };
  }

  const items =
    input.items ??
    existing.items.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      sortOrder: item.sortOrder,
    }));

  const calculated = calculateItems(items);

  const discount =
    input.discount !== undefined
      ? Number(input.discount)
      : Number(existing.discount);

  const total = calculateTotal(
    calculated.subtotal,
    discount
  );

  const quote = await prisma.$transaction(
    async (tx) => {
      if (input.items) {
        await tx.quoteItem.deleteMany({
          where: {
            quoteId: id,
          },
        });
      }

      return tx.quote.update({
        where: {
          id,
        },

        data: {
          customerId,

          title:
            input.title ?? existing.title,

          description:
            input.description !== undefined
              ? input.description
              : existing.description,

          subtotal:
            calculated.subtotal.toFixed(2),

          discount:
            discount.toFixed(2),

          total:
            total.toFixed(2),

          validUntil:
            input.validUntil !== undefined
              ? input.validUntil
                ? new Date(input.validUntil)
                : null
              : existing.validUntil,

          notes:
            input.notes !== undefined
              ? input.notes
              : existing.notes,

          terms:
            input.terms !== undefined
              ? input.terms
              : existing.terms,

          ...(input.items
            ? {
                items: {
                  create: calculated.items,
                },
              }
            : {}),
        },

        include: {
          customer: true,

          items: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });
    }
  );

  return {
    quote,
  };
}

export async function updateQuoteStatus(
  id: string,
  organizationId: string,
  status: QuoteStatus
) {
  const existing = await prisma.quote.findFirst({
    where: {
      id,
      organizationId,
      deletedAt: null,
    },

    select: {
      id: true,
    },
  });

  if (!existing) {
    return null;
  }

  return prisma.quote.update({
    where: {
      id: existing.id,
    },

    data: {
      status,
    },

    include: {
      customer: true,

      items: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
}

export async function deleteQuote(
  id: string,
  organizationId: string
) {
  const existing = await prisma.quote.findFirst({
    where: {
      id,
      organizationId,
      deletedAt: null,
    },

    select: {
      id: true,
    },
  });

  if (!existing) {
    return null;
  }

  return prisma.quote.update({
    where: {
      id: existing.id,
    },

    data: {
      deletedAt: new Date(),
    },
  });
}