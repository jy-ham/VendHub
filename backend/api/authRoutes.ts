// import { Hono } from "hono";
// import { sign, verify } from "hono/jwt";
// import { z } from "zod";
// import bcrypt from "bcryptjs";

// // Define the shape of a User
// interface User {
//   id: number;
//   email: string;
//   password: string; // hashed password
// }

// // Temporary in-memory storage
// const users: User[] = [];
// let userId = 1;

// // Input validation schema
// const userSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
// });

// // Export auth routes with JWT_SECRET variable support
// export const authRoutes = new Hono<{ Variables: { JWT_SECRET: string } }>();

// // Register route
// // This route allows users to register by providing an email and password
// authRoutes.post("/register", async (c) => {
//   const body = await c.req.json();
//   const parsed = userSchema.safeParse(body);
//   if (!parsed.success) {
//     return c.json({ error: "Invalid input" }, 400);
//   }

//   const { email, password } = parsed.data;

//   // Check for existing user
//   const existing = users.find((u) => u.email === email);
//   if (existing) {
//     return c.json({ error: "User already exists" }, 409);
//   }

//   // Hash password and store user
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const newUser = { id: userId++, email, password: hashedPassword };
//   users.push(newUser);

//   // Sign token
//   const token = await sign({ id: newUser.id, email }, c.var.JWT_SECRET);
//   return c.json({ token, user: { id: newUser.id, email } });
// });


// // Login route
// // This route checks the credentials and returns a JWT token if valid
// authRoutes.post("/login", async (c) => {
//   const body = await c.req.json();
//   const parsed = userSchema.safeParse(body);
//   if (!parsed.success) {
//     return c.json({ error: "Invalid input" }, 400);
//   }

//   const { email, password } = parsed.data;
//   const user = users.find((u) => u.email === email);
//   if (!user) {
//     return c.json({ error: "User not found" }, 404);
//   }

//   const valid = await bcrypt.compare(password, user.password);
//   if (!valid) {
//     return c.json({ error: "Invalid credentials" }, 401);
//   }

//   const token = await sign({ id: user.id, email }, c.var.JWT_SECRET);
//   return c.json({ token, user: { id: user.id, email } });
// });


// // Protected GET route
// // This route requires a valid JWT token to access
// authRoutes.get("/me", async (c) => {
//   const authHeader = c.req.header("Authorization");
//   if (!authHeader) {
//     return c.json({ error: "Missing token" }, 401);
//   }

//   const token = authHeader.replace("Bearer ", "");

//   try {
//     const payload = await verify(token, c.var.JWT_SECRET);
//     return c.json({ user: payload });
//   } catch {
//     return c.json({ error: "Invalid or expired token" }, 401);
//   }
// });
