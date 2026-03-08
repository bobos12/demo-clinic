const DB_STORAGE_KEY = "eyeClinic_demo_db_v1";

const nowIso = () => new Date().toISOString();

const safeJsonParse = (value, fallback) => {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const makeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const seedDb = () => {
  const doctor = {
    _id: "user_demo_doctor",
    name: "Dr. Demo",
    email: "doctor@eyeclinic.com",
    role: "doctor",
  };

  const receptionist = {
    _id: "user_demo_reception",
    name: "Reception Demo",
    email: "reception@eyeclinic.com",
    role: "receptionist",
  };

  const patients = [
    {
      _id: "pat_demo_1",
      code: "P-0001",
      name: "Ahmed Ali",
      phone: "+20 100 000 0001",
      age: 34,
      gender: "male",
      address: "Cairo",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
    {
      _id: "pat_demo_2",
      code: "P-0002",
      name: "Sara Mohamed",
      phone: "+20 100 000 0002",
      age: 28,
      gender: "female",
      address: "Giza",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    },
  ];

  const visits = [
    {
      _id: "vis_demo_1",
      patientId: "pat_demo_1",
      doctorId: doctor._id,
      visitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      complaint: { blurredVision: { years: "0", months: "2", days: "0" } },
      medicalHistory: {},
      surgicalHistory: {},
      recommendations: "Artificial tears, follow up in 1 month.",
      followUp: { years: "0", months: "1", days: "0" },
      followUpDate: "",
      eyeExam: {
        visualAcuity: { OD: "6/9", OS: "6/12" },
        oldGlasses: { OD: { sphere: "", cylinder: "", axis: "" }, OS: { sphere: "", cylinder: "", axis: "" } },
        refraction: {
          OD: { sphere: "-0.50", cylinder: "", axis: "", ADD: "" },
          OS: { sphere: "-0.75", cylinder: "", axis: "", ADD: "" },
        },
        newPrescription: { OD: { sphere: "-0.50", cylinder: "", axis: "" }, OS: { sphere: "-0.75", cylinder: "", axis: "" } },
        externalAppearance: { OD: { values: [], other: "" }, OS: { values: [], other: "" } },
        ocularMotility: { OD: { values: [], other: "" }, OS: { values: [], other: "" } },
        eyelid: { OD: { values: [], other: "" }, OS: { values: [], other: "" } },
        conjunctiva: { OD: { values: [], other: "" }, OS: { values: [], other: "" } },
        cornea: { OD: { values: [], other: "" }, OS: { values: [], other: "" } },
        sclera: { OD: { values: [], other: "" }, OS: { values: [], other: "" } },
        anteriorChamber: { OD: { values: [], other: "" }, OS: { values: [], other: "" } },
        iris: { OD: { values: [], other: "" }, OS: { values: [], other: "" } },
        pupil: { OD: { values: [], other: "" }, OS: { values: [], other: "" } },
        lens: { OD: { values: [], other: "" }, OS: { values: [], other: "" } },
        posteriorSegment: { OD: { values: [], other: "" }, OS: { values: [], other: "" } },
        others: { OD: "", OS: "" },
        iop: { OD: "15", OS: "16" },
      },
    },
  ];

  return {
    users: [doctor, receptionist],
    patients,
    visits,
  };
};

const loadDb = () => {
  const db = safeJsonParse(localStorage.getItem(DB_STORAGE_KEY), null);
  if (db && db.users && db.patients && db.visits) return db;
  const seeded = seedDb();
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

const saveDb = (db) => {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
};

const ok = (data) => Promise.resolve({ data });
const notFound = (message = "Not found") =>
  Promise.reject({ message, status: 404, data: { message } });
const badRequest = (message = "Bad request") =>
  Promise.reject({ message, status: 400, data: { message } });

const hydrateVisit = (db, visit) => {
  const patient = db.patients.find((p) => p._id === visit.patientId) || null;
  const doctor = db.users.find((u) => u._id === visit.doctorId) || null;
  return {
    ...visit,
    patientId: patient ? { ...patient } : null,
    doctorId: doctor ? { ...doctor } : null,
  };
};

const getUserFromToken = () => {
  const raw = localStorage.getItem("user");
  const user = safeJsonParse(raw, null);
  return user && user._id ? user : null;
};

const normalizePath = (url) => {
  const qIndex = url.indexOf("?");
  return qIndex >= 0 ? url.slice(0, qIndex) : url;
};

const getQueryParams = (url) => {
  const qIndex = url.indexOf("?");
  if (qIndex < 0) return {};
  const query = url.slice(qIndex + 1);
  const params = new URLSearchParams(query);
  const obj = {};
  params.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
};

const demoApiClient = {
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },

  async get(url, config = {}) {
    const db = loadDb();
    const path = normalizePath(url);
    const params = { ...(config.params || {}), ...getQueryParams(url) };

    if (path === "/health") return ok({ status: "ok", mode: "demo" });

    if (path === "/auth/me") {
      const user = getUserFromToken();
      if (!user) return Promise.reject({ message: "Unauthorized", status: 401, data: { message: "Unauthorized" } });
      return ok(user);
    }

    if (path === "/users") return ok(db.users);
    if (path.startsWith("/users/")) {
      const id = path.split("/")[2];
      const user = db.users.find((u) => u._id === id);
      if (!user) return notFound("User not found");
      return ok(user);
    }

    if (path === "/patients") return ok(db.patients);
    if (path === "/patients/search") {
      const q = (params.q || "").toLowerCase().trim();
      if (!q) return ok(db.patients);
      const results = db.patients.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          (p.phone || "").includes(params.q || "")
      );
      return ok(results);
    }
    if (path.startsWith("/patients/") && path.endsWith("/visits")) {
      const patientId = path.split("/")[2];
      const visits = db.visits
        .filter((v) => v.patientId === patientId)
        .map((v) => hydrateVisit(db, v));
      return ok(visits);
    }
    if (path.startsWith("/patients/")) {
      const id = path.split("/")[2];
      const patient = db.patients.find((p) => p._id === id);
      if (!patient) return notFound("Patient not found");
      return ok(patient);
    }

    if (path === "/visits") return ok(db.visits.map((v) => hydrateVisit(db, v)));
    if (path.startsWith("/visits/")) {
      const id = path.split("/")[2];
      const visit = db.visits.find((v) => v._id === id);
      if (!visit) return notFound("Visit not found");
      return ok(hydrateVisit(db, visit));
    }

    return notFound(`Unknown endpoint: ${path}`);
  },

  async post(url, body) {
    const db = loadDb();
    const path = normalizePath(url);

    if (path === "/auth/login") {
      const email = (body?.email || "").toLowerCase().trim();
      const found = db.users.find((u) => u.email.toLowerCase() === email);
      const user = found || db.users.find((u) => u.role === "doctor") || db.users[0];
      const token = "demo-token";

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return ok({ token, ...user });
    }

    if (path === "/patients") {
      if (!body?.name || !body?.phone || body?.age === "" || !body?.gender) {
        return badRequest("Missing required patient fields");
      }

      const newPatient = {
        _id: makeId(),
        code: body.code || `P-${String(db.patients.length + 1).padStart(4, "0")}`,
        name: body.name,
        phone: body.phone,
        age: Number(body.age),
        gender: body.gender,
        address: body.address || "",
        createdAt: nowIso(),
      };
      db.patients.unshift(newPatient);
      saveDb(db);
      return ok(newPatient);
    }

    if (path === "/visits") {
      if (!body?.patientId) return badRequest("patientId is required");

      const user = getUserFromToken() || db.users.find((u) => u.role === "doctor") || db.users[0];
      const visit = {
        _id: makeId(),
        ...body,
        patientId: body.patientId,
        doctorId: user?._id || "user_demo_doctor",
        visitDate: body.visitDate || nowIso(),
        createdAt: nowIso(),
      };
      db.visits.unshift(visit);
      saveDb(db);
      return ok(hydrateVisit(db, visit));
    }

    return notFound(`Unknown endpoint: ${path}`);
  },

  async put(url, body) {
    const db = loadDb();
    const path = normalizePath(url);

    if (path.startsWith("/patients/")) {
      const id = path.split("/")[2];
      const idx = db.patients.findIndex((p) => p._id === id);
      if (idx < 0) return notFound("Patient not found");
      db.patients[idx] = { ...db.patients[idx], ...body };
      saveDb(db);
      return ok(db.patients[idx]);
    }

    if (path.startsWith("/visits/")) {
      const id = path.split("/")[2];
      const idx = db.visits.findIndex((v) => v._id === id);
      if (idx < 0) return notFound("Visit not found");
      db.visits[idx] = { ...db.visits[idx], ...body };
      saveDb(db);
      return ok(hydrateVisit(db, db.visits[idx]));
    }

    if (path.startsWith("/users/")) {
      const id = path.split("/")[2];
      const idx = db.users.findIndex((u) => u._id === id);
      if (idx < 0) return notFound("User not found");
      db.users[idx] = { ...db.users[idx], ...body };
      saveDb(db);
      return ok(db.users[idx]);
    }

    return notFound(`Unknown endpoint: ${path}`);
  },

  async delete(url) {
    const db = loadDb();
    const path = normalizePath(url);

    if (path.startsWith("/patients/")) {
      const id = path.split("/")[2];
      const exists = db.patients.some((p) => p._id === id);
      if (!exists) return notFound("Patient not found");
      db.patients = db.patients.filter((p) => p._id !== id);
      db.visits = db.visits.filter((v) => v.patientId !== id);
      saveDb(db);
      return ok({ deleted: true });
    }

    if (path.startsWith("/visits/")) {
      const id = path.split("/")[2];
      const exists = db.visits.some((v) => v._id === id);
      if (!exists) return notFound("Visit not found");
      db.visits = db.visits.filter((v) => v._id !== id);
      saveDb(db);
      return ok({ deleted: true });
    }

    if (path.startsWith("/users/")) {
      const id = path.split("/")[2];
      const exists = db.users.some((u) => u._id === id);
      if (!exists) return notFound("User not found");
      db.users = db.users.filter((u) => u._id !== id);
      saveDb(db);
      return ok({ deleted: true });
    }

    return notFound(`Unknown endpoint: ${path}`);
  },
};

export default demoApiClient;

