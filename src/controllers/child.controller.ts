import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ChildProfile } from "../models/child.model";
import { createChildDTO, updateChildDTO } from "../dtos/child.dto";

// GET /api/children — get all children for logged in parent
export const getMyChildren = async (req: AuthRequest, res: Response) => {
  try {
    const parentId = req.user?.id;
    const children = await ChildProfile.find({ parentId }).sort({ createdAt: -1 });
    return res.json(children);
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};

// GET /api/children/:id — get single child
export const getChildById = async (req: AuthRequest, res: Response) => {
  try {
    const child = await ChildProfile.findOne({ _id: req.params.id, parentId: req.user?.id });
    if (!child) return res.status(404).json({ message: "Child profile not found" });
    return res.json(child);
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};

// POST /api/children — create child profile
export const createChild = async (req: AuthRequest, res: Response) => {
  const parsed = createChildDTO.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const child = await ChildProfile.create({
      parentId: req.user?.id,
      ...parsed.data,
    });
    return res.status(201).json({ message: "Child profile created", data: child });
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};

// PUT /api/children/:id — update child profile
export const updateChild = async (req: AuthRequest, res: Response) => {
  const parsed = updateChildDTO.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const child = await ChildProfile.findOneAndUpdate(
      { _id: req.params.id, parentId: req.user?.id },
      parsed.data,
      { new: true }
    );
    if (!child) return res.status(404).json({ message: "Child profile not found" });
    return res.json({ message: "Child profile updated", data: child });
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};

// DELETE /api/children/:id — delete child profile
export const deleteChild = async (req: AuthRequest, res: Response) => {
  try {
    const child = await ChildProfile.findOneAndDelete({ _id: req.params.id, parentId: req.user?.id });
    if (!child) return res.status(404).json({ message: "Child profile not found" });
    return res.json({ message: "Child profile deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};