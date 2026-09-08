import Report, { REPORT_REASON_VALUES } from "../models/Report.js";
import User from "../models/User.js";

export const createReport = async (req, res) => {
  try {
    const reporterId = req.user._id;
    const { reportedUserId, reason, details } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ message: "reportedUserId and reason are required" });
    }

    if (!REPORT_REASON_VALUES.includes(reason)) {
      return res.status(400).json({ message: "Invalid report reason" });
    }

    if (reportedUserId.toString() === reporterId.toString()) {
      return res.status(400).json({ message: "You cannot report yourself" });
    }

    const targetExists = await User.exists({ _id: reportedUserId });

    if (!targetExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const report = await Report.create({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reason,
      details: details?.trim() ? details.trim() : undefined,
    });

    return res.status(201).json({
      message: "Report submitted. Our team will review it shortly.",
      report,
    });
  } catch (error) {
    console.error("Fail when createReport", error);
    return res.status(500).json({ message: "Failed to submit report" });
  }
};
