import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../../middlewares/auth.js";

import {
  createQuoteSchema,
  quoteIdParamsSchema,
  quoteQuerySchema,
  updateQuoteSchema,
  updateQuoteStatusSchema,
} from "./quote.schemas.js";

import {
  createQuote,
  deleteQuote,
  getQuoteById,
  listQuotes,
  updateQuote,
  updateQuoteStatus,
} from "./quote.service.js";

export async function quoteRoutes(
  app: FastifyInstance
) {
  app.addHook("preHandler", authenticate);

  /*
   * LISTAR ORÇAMENTOS
   */
  app.get("/", async (request) => {
    const query = quoteQuerySchema.parse(
      request.query
    );

    const quotes = await listQuotes(
      request.auth.organizationId,
      query
    );

    return {
      quotes,
    };
  });

  /*
   * BUSCAR ORÇAMENTO POR ID
   */
  app.get("/:id", async (request, reply) => {
    const params = quoteIdParamsSchema.parse(
      request.params
    );

    const quote = await getQuoteById(
      params.id,
      request.auth.organizationId
    );

    if (!quote) {
      return reply.code(404).send({
        message: "Orçamento não encontrado.",
      });
    }

    return {
      quote,
    };
  });

  /*
   * CRIAR ORÇAMENTO
   */
  app.post("/", async (request, reply) => {
    const body = createQuoteSchema.parse(
      request.body
    );

    const result = await createQuote(
      request.auth.organizationId,
      body
    );

    if ("error" in result) {
      if (
        result.error === "CUSTOMER_NOT_FOUND"
      ) {
        return reply.code(404).send({
          message: "Cliente não encontrado.",
        });
      }

      return reply.code(400).send({
        message:
          "Não foi possível criar o orçamento.",
      });
    }

    const quote = result.quote;

    await prisma.auditLog.create({
      data: {
        organizationId:
          request.auth.organizationId,

        userId: request.auth.sub,

        action: "CREATE_QUOTE",

        entityType: "Quote",

        entityId: quote.id,

        metadata: {
          number: quote.number,
          customerId: quote.customerId,
          total: quote.total.toString(),
        },
      },
    });

    return reply.code(201).send({
      quote,
    });
  });

  /*
   * ATUALIZAR ORÇAMENTO
   */
  app.put("/:id", async (request, reply) => {
    const params = quoteIdParamsSchema.parse(
      request.params
    );

    const body = updateQuoteSchema.parse(
      request.body
    );

    const result = await updateQuote(
      params.id,
      request.auth.organizationId,
      body
    );

    if ("error" in result) {
      if (
        result.error === "QUOTE_NOT_FOUND"
      ) {
        return reply.code(404).send({
          message:
            "Orçamento não encontrado.",
        });
      }

      if (
        result.error === "CUSTOMER_NOT_FOUND"
      ) {
        return reply.code(404).send({
          message: "Cliente não encontrado.",
        });
      }

      return reply.code(400).send({
        message:
          "Não foi possível atualizar o orçamento.",
      });
    }

    const quote = result.quote;

    await prisma.auditLog.create({
      data: {
        organizationId:
          request.auth.organizationId,

        userId: request.auth.sub,

        action: "UPDATE_QUOTE",

        entityType: "Quote",

        entityId: quote.id,

        metadata: {
          number: quote.number,
          total: quote.total.toString(),
        },
      },
    });

    return {
      quote,
    };
  });

  /*
   * ALTERAR STATUS
   */
  app.patch(
    "/:id/status",
    async (request, reply) => {
      const params =
        quoteIdParamsSchema.parse(
          request.params
        );

      const body =
        updateQuoteStatusSchema.parse(
          request.body
        );

      const quote =
        await updateQuoteStatus(
          params.id,
          request.auth.organizationId,
          body.status
        );

      if (!quote) {
        return reply.code(404).send({
          message:
            "Orçamento não encontrado.",
        });
      }

      await prisma.auditLog.create({
        data: {
          organizationId:
            request.auth.organizationId,

          userId: request.auth.sub,

          action:
            "UPDATE_QUOTE_STATUS",

          entityType: "Quote",

          entityId: quote.id,

          metadata: {
            number: quote.number,
            status: quote.status,
          },
        },
      });

      return {
        quote,
      };
    }
  );

  /*
   * EXCLUIR ORÇAMENTO
   */
  app.delete(
    "/:id",
    async (request, reply) => {
      const params =
        quoteIdParamsSchema.parse(
          request.params
        );

      const quote = await deleteQuote(
        params.id,
        request.auth.organizationId
      );

      if (!quote) {
        return reply.code(404).send({
          message:
            "Orçamento não encontrado.",
        });
      }

      await prisma.auditLog.create({
        data: {
          organizationId:
            request.auth.organizationId,

          userId: request.auth.sub,

          action: "DELETE_QUOTE",

          entityType: "Quote",

          entityId: quote.id,

          metadata: {
            number: quote.number,
          },
        },
      });

      return reply.code(204).send();
    }
  );
}