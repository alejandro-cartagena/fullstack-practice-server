import express from "express";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
const router = express.Router();

// CREATE A PROJECT
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    const createdProject = await Project.create({ title, description });
    res.status(201).json(createdProject);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// GET ALL PROJECTS
router.get("/", async (req, res) => {
  try {
    const allProjects = await Project.find().populate("tasks");

    res.json(allProjects);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// GET SINGLE PROJECT
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const singleProject = await Project.findById(projectId).populate("tasks");

    res.status(200).json(singleProject);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// UPDATE PROJECT
router.put("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      {
        runValidators: true,
        new: true,
      }
    );

    res.status(200).json(updatedProject);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// DELETE PROJECT
router.delete("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const deletedProject = await Project.findByIdAndDelete(projectId);

    for (const task of deletedProject.tasks) {
      await Task.findByIdAndDelete(task);
    }

    res.status(200).json({ message: "Project successfully deleted!!!!" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

export default router;
