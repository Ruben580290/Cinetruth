import { EntitySchema } from "typeorm";

const AnalysisSchema = new EntitySchema({
  name: "Analysis",
  tableName: "analysis_history",

  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },

    type: {
      type: String,
      length: 10,
    },

    verdict: {
      type: String,
      length: 20,
    },

    suspicionScore: {
      name: "suspicionScore",
      type: Number,
      nullable: true,
    },

    summary: {
      type: "text",
    },

    resultData: {
      name: "resultData",
      type: "jsonb",
    },

    createdAt: {
      name: "createdAt",
      type: "timestamp",
      createDate: true,
    },
  },

  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "userId" },
      onDelete: "CASCADE",
    },
  },
});

export default AnalysisSchema;
