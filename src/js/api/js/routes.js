// routes.js - Rotas para criar, aceitar e finalizar corrida

import express from "express";
import { db } from "./firebase.js";

const router = express.Router();

// Criar nova corrida
router.post("/corrida", async (req, res) => {
  const nova = db.ref("corridas").push();
  await nova.set({
	...req.body,
	status: "pendente",
	timestamp: Date.now(),
  });
  res.json({ id: nova.key });
});

// Aceitar corrida
router.post("/corrida/:id/aceitar", async (req, res) => {
  const ref = db.ref(`corridas/${req.params.id}`);
  await ref.update({
	...req.body,
	status: "aceita",
  });
  res.json({ status: "aceita" });
});

// Finalizar corrida
router.post("/corrida/:id/finalizar", async (req, res) => {
  const ref = db.ref(`corridas/${req.params.id}`);
  await ref.update({
	status: "finalizada",
	horaFinal: Date.now(),
  });
  res.json({ status: "finalizada" });
});

export default router;
