import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// --- Mock del repositorio ANTES de importar las rutas/controladores ---
const mockFindAnalysisQueryById = jest.fn();
const mockDeleteAnalysisQuery = jest.fn();
const mockUpdateSimilarCaseReview = jest.fn();
const mockFindAnalysisQueries = jest.fn();
const mockCountAnalysisQueries = jest.fn();
const mockUpdateAnalysisQueryReview = jest.fn();

jest.unstable_mockModule("../repositories/analysisQueryRepository.js", () => ({
  findAnalysisQueryById: mockFindAnalysisQueryById,
  deleteAnalysisQuery: mockDeleteAnalysisQuery,
  updateSimilarCaseReview: mockUpdateSimilarCaseReview,
  findAnalysisQueries: mockFindAnalysisQueries,
  countAnalysisQueries: mockCountAnalysisQueries,
  updateAnalysisQueryReview: mockUpdateAnalysisQueryReview,
}));

const { default: historyRouter } = await import("../routes/historyRoutes.js");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/history", historyRouter);
  return app;
};

const tokenFor = (userId, role = "user") =>
  jwt.sign({ sub: userId, role }, JWT_SECRET);

const OWNER_ID = 10;
const OTHER_USER_ID = 99;

const sampleRecord = (overrides = {}) => ({
  id: 5,
  userId: OWNER_ID,
  resultData: {
    similarCases: [
      { title: "Caso A", sourceUrl: "https://a.test" },
      { title: "Caso B", sourceUrl: "https://b.test" },
    ],
  },
  reviewedSimilarCases: [],
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DELETE /api/history/:id", () => {
  it("elimina el registro cuando el usuario es el dueño", async () => {
    mockFindAnalysisQueryById.mockResolvedValue(sampleRecord());
    mockDeleteAnalysisQuery.mockResolvedValue({ id: 5 });

    const app = buildApp();
    const response = await request(app)
      .delete("/api/history/5")
      .set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`);

    expect(response.status).toBe(200);
    expect(mockDeleteAnalysisQuery).toHaveBeenCalledWith(5, OWNER_ID);
  });

  it("responde 403 si el usuario no es dueño del registro", async () => {
    mockFindAnalysisQueryById.mockResolvedValue(sampleRecord());

    const app = buildApp();
    const response = await request(app)
      .delete("/api/history/5")
      .set("Authorization", `Bearer ${tokenFor(OTHER_USER_ID)}`);

    expect(response.status).toBe(403);
    expect(mockDeleteAnalysisQuery).not.toHaveBeenCalled();
  });

  it("responde 404 si el registro no existe", async () => {
    mockFindAnalysisQueryById.mockResolvedValue(null);

    const app = buildApp();
    const response = await request(app)
      .delete("/api/history/999")
      .set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`);

    expect(response.status).toBe(404);
  });

  it("responde 401 si no se envia token", async () => {
    const app = buildApp();
    const response = await request(app).delete("/api/history/5");

    expect(response.status).toBe(401);
    expect(mockFindAnalysisQueryById).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/history/:id/similar-cases/:caseIndex", () => {
  it("marca un caso similar como revisado cuando el usuario es el dueño", async () => {
    mockFindAnalysisQueryById.mockResolvedValue(sampleRecord());
    mockUpdateSimilarCaseReview.mockResolvedValue({
      id: 5,
      reviewedSimilarCases: [0],
    });

    const app = buildApp();
    const response = await request(app)
      .patch("/api/history/5/similar-cases/0")
      .set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ reviewed: true });

    expect(response.status).toBe(200);
    expect(mockUpdateSimilarCaseReview).toHaveBeenCalledWith(
      5,
      OWNER_ID,
      0,
      true,
    );
  });

  it("responde 403 si el usuario no es dueño del registro", async () => {
    mockFindAnalysisQueryById.mockResolvedValue(sampleRecord());

    const app = buildApp();
    const response = await request(app)
      .patch("/api/history/5/similar-cases/0")
      .set("Authorization", `Bearer ${tokenFor(OTHER_USER_ID)}`)
      .send({ reviewed: true });

    expect(response.status).toBe(403);
    expect(mockUpdateSimilarCaseReview).not.toHaveBeenCalled();
  });

  it("responde 404 si el indice del caso similar no existe", async () => {
    mockFindAnalysisQueryById.mockResolvedValue(sampleRecord());

    const app = buildApp();
    const response = await request(app)
      .patch("/api/history/5/similar-cases/9")
      .set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ reviewed: true });

    expect(response.status).toBe(404);
    expect(mockUpdateSimilarCaseReview).not.toHaveBeenCalled();
  });

  it("responde 400 si 'reviewed' no es booleano", async () => {
    mockFindAnalysisQueryById.mockResolvedValue(sampleRecord());

    const app = buildApp();
    const response = await request(app)
      .patch("/api/history/5/similar-cases/0")
      .set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ reviewed: "si" });

    expect(response.status).toBe(400);
    expect(mockUpdateSimilarCaseReview).not.toHaveBeenCalled();
  });
});
