import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import session from "express-session";
import cookieParser from "cookie-parser";
import flash from "connect-flash";
import { body, check, validationResult } from "express-validator";
import { startServer } from "./utils/db.js";
import Contact from "./model/contact.js";
import methodOverride from "method-override";

const app = express();
const port = 3000;
startServer();

app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  const data = {
    title: "Mongo Contact App",
    layout: "layouts/main-layout",
    name: "Mochammad Fajrin",
    distroName: "Ubuntu",
    phoneNumber: "08816018033",
  };
  res.render("index", data);
});

app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();

  const data = {
    title: "Contact Page",
    layout: "layouts/main-layout",
    msg: req.flash("msg"),
    contacts,
  };
  res.render("contact", data);
});

app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Add Contact",
    layout: "layouts/main-layout",
  });
});

app.post(
  "/contact",
  [
    body("username").custom(async (value) => {
      const duplicate = await Contact.findOne({ username: value });
      if (duplicate) {
        throw new Error("Username has alredy used");
      }
      return true;
    }),
    check("email", "Invalid email format").isEmail(),
    check("mobilePhone", "Invalid mobile phone number format").isMobilePhone(
      "id-ID"
    ),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Error - Add Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body);
      req.flash("msg", "New contact added successfully!");
      res.redirect("/contact");
    }
  }
);

app.get("/contact/edit-contact/:id", async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id });
  const data = {
    title: `Edit Contact ${contact.username}`,
    layout: "layouts/main-layout",
    contact,
  };
  res.render("edit-contact", data);
});

app.put(
  "/contact",
  [
    body("username").custom(async (value) => {
      const duplicate = await Contact.findOne({ username: value });
      if (duplicate) {
        throw new Error("Username has alredy used");
      }
      return true;
    }),
    check("email", "Invalid email format").isEmail(),
    check("mobilePhone", "Invalid mobile phone number format").isMobilePhone(
      "id-ID"
    ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Error - Edit Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      await Contact.updateOne(
        {
          _id: req.body.id,
        },
        {
          $set: {
            username: req.body.username,
            mobilePhone: req.body.mobilePhone,
            email: req.body.email,
          },
        }
      );
      req.flash("msg", "Contact updated successfully!");
      res.redirect("/contact");
    }
  }
);

app.delete("/contact", async (req, res) => {
  await Contact.deleteOne({ _id: req.body._id });
  req.flash("msg", "Contact successfully deleted");
  res.redirect("/contact");
});

app.get("/contact/:id", async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
  });
  const data = {
    title: `Detail Page ${contact.username}`,
    layout: "layouts/main-layout",
    contact,
  };
  res.render("detail", data);
});

app.get("/about", (req, res) => {
  const data = {
    title: "About Page",
    layout: "layouts/main-layout",
  };
  res.render("about", data);
});

app.listen(port, () => {
  console.log(`Mongo Contact App | Listening at http://localhost:${port}`);
});
