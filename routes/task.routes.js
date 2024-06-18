import express from "express";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { title, status, projectId } = req.body;

    const createdTask = await Task.create({
      title,
      status,
      project: projectId,
    });

    await Project.findByIdAndUpdate(
      projectId,
      {
        $push: { tasks: createdTask._id },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(createdTask);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.delete("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    const taskToDelete = await Task.findByIdAndDelete(taskId);

    const updatedProject = await Project.findByIdAndUpdate(
      taskToDelete.project,
      { $pull: { tasks: taskId } },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Task deleted successfully and removed from project" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.put("/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { title, status } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (status !== undefined) updateData.status = status;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ message: "Task updated successfully", updatedTask });
});

export default router;
