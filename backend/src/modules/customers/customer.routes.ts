import type { FastifyInstance } from "fastify";

import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../../middlewares/auth.js";

import {
  createCustomerSchema,
  customerIdParamsSchema,
  customerQuerySchema,
  updateCustomerSchema,
} from "./customer.schemas.js";

import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "./customer.service.js";

export async function customerRoutes(
  app: FastifyInstance
) {
  app.addHook("preHandler", authenticate);

  /*
   * LISTAR CLIENTES
   */
  app.get("/", async (request) => {
    const query = customerQuerySchema.parse(
      request.query
    );

    const customers = await listCustomers(
      request.auth.organizationId,
      query.search
    );

    return {
      customers,
    };
  });

  /*
   * BUSCAR CLIENTE POR ID
   */
  app.get("/:id", async (request, reply) => {
    const params = customerIdParamsSchema.parse(
      request.params
    );

    const customer = await getCustomerById(
      request.auth.organizationId,
      params.id
    );

    if (!customer) {
      return reply.code(404).send({
        message: "Cliente não encontrado.",
      });
    }

    return {
      customer,
    };
  });

  /*
   * CRIAR CLIENTE
   */
  app.post("/", async (request, reply) => {
    const input = createCustomerSchema.parse(
      request.body
    );

    const customer = await createCustomer(
      request.auth.organizationId,
      input
    );

    await prisma.auditLog.create({
      data: {
        organizationId:
          request.auth.organizationId,

        userId:
          request.auth.sub,

        action:
          "CREATE_CUSTOMER",

        entityType:
          "Customer",

        entityId:
          customer.id,
      },
    });

    return reply.code(201).send({
      customer,
    });
  });

  /*
   * ATUALIZAR CLIENTE
   */
  app.put("/:id", async (request, reply) => {
    const params = customerIdParamsSchema.parse(
      request.params
    );

    const input = updateCustomerSchema.parse(
      request.body
    );

    const customer = await updateCustomer(
      request.auth.organizationId,
      params.id,
      input
    );

    if (!customer) {
      return reply.code(404).send({
        message: "Cliente não encontrado.",
      });
    }

    await prisma.auditLog.create({
      data: {
        organizationId:
          request.auth.organizationId,

        userId:
          request.auth.sub,

        action:
          "UPDATE_CUSTOMER",

        entityType:
          "Customer",

        entityId:
          customer.id,
      },
    });

    return {
      customer,
    };
  });

  /*
   * EXCLUIR CLIENTE
   */
  app.delete(
    "/:id",
    async (request, reply) => {
      const params =
        customerIdParamsSchema.parse(
          request.params
        );

      const customer = await deleteCustomer(
        request.auth.organizationId,
        params.id
      );

      if (!customer) {
        return reply.code(404).send({
          message:
            "Cliente não encontrado.",
        });
      }

      await prisma.auditLog.create({
        data: {
          organizationId:
            request.auth.organizationId,

          userId:
            request.auth.sub,

          action:
            "DELETE_CUSTOMER",

          entityType:
            "Customer",

          entityId:
            customer.id,
        },
      });

      return reply.code(204).send();
    }
  );
}