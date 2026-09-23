import { prisma } from "../../lib/prisma.js";

type CustomerInput = {
  type?: "INDIVIDUAL" | "BUSINESS";

  name: string;

  cpf?: string | null;
  cnpj?: string | null;

  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;

  cep?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;

  notes?: string | null;
};

export async function createCustomer(
  organizationId: string,
  data: CustomerInput
) {
  return prisma.customer.create({
    data: {
      organizationId,

      type: data.type ?? "INDIVIDUAL",
      name: data.name,

      cpf: data.cpf ?? null,
      cnpj: data.cnpj ?? null,

      phone: data.phone ?? null,
      whatsapp: data.whatsapp ?? null,
      email: data.email ?? null,

      cep: data.cep ?? null,
      address: data.address ?? null,
      number: data.number ?? null,
      complement: data.complement ?? null,
      neighborhood: data.neighborhood ?? null,
      city: data.city ?? null,
      state: data.state ?? null,

      notes: data.notes ?? null,
    },
  });
}

export async function listCustomers(
  organizationId: string,
  search?: string
) {
  return prisma.customer.findMany({
    where: {
      organizationId,
      deletedAt: null,

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                phone: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                whatsapp: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                cpf: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                cnpj: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCustomerById(
  organizationId: string,
  customerId: string
) {
  return prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
      deletedAt: null,
    },
  });
}

export async function updateCustomer(
  organizationId: string,
  customerId: string,
  data: Partial<CustomerInput>
) {
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!existingCustomer) {
    return null;
  }

  return prisma.customer.update({
    where: {
      id: existingCustomer.id,
    },

    data: {
      ...data,
    },
  });
}

export async function deleteCustomer(
  organizationId: string,
  customerId: string
) {
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!existingCustomer) {
    return null;
  }

  return prisma.customer.update({
    where: {
      id: existingCustomer.id,
    },

    data: {
      deletedAt: new Date(),
    },
  });
}