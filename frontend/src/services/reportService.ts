import api from "@/lib/axios";
import type { CreateReportPayload } from "@/types/report";

export const reportService = {
  createReport: async (payload: CreateReportPayload) => {
    const res = await api.post("/reports", payload);
    return res.data as { message: string };
  },
};
