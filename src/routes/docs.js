import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    info: {
      title: "Platipus API",
      version: "1.0.0",
      description: "Manual API docs for Event Management project",
    },
    routes: [
      {
        method: "POST",
        path: "/auth/register",
        description: "Register a new user",
        body: {
          name: "string",
          email: "string",
          role: "eo | sponsor",
          phone: "string",
          password: "string",
          confirm_password: "string",
        },
        responses: {
          201: { user: "object", token: "string" },
          400: "Validation error",
          409: "Email already registered",
        },
      },
      {
        method: "POST",
        path: "/auth/login",
        description: "Login user",
        body: { email: "string", password: "string" },
        responses: {
          200: { user: "object", token: "string" },
          400: "Email/password missing",
          401: "Invalid credentials",
        },
      },
      // Tambahkan semua endpoint lainnya...
    ],
  });
});

export default router;
