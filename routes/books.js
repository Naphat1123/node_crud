const e = require("express");
let express = require("express");
let router = express.Router();
let dbCon = require("../lib/db");
const upload = require("express-fileupload");
const path = require("path");

router.use(upload());
router.use(express.static("upload"));

//  display books page

router.get("/", (req, res, next) => {
  dbCon.query("SELECT * FROM books ORDER BY id asc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("books", { data: "" });
    } else {
      res.render("books", { data: rows });
    }
  });
});

//display addbook page

router.get("/add", (req, res, next) => {
  res.render("books/add", {
    name: "",
    author: "",
  });
});

// add new books
router.post("/add", (req, res, next) => {
  //เก็บตัวแปรจากฟอร์ม input
  let name = req.body.name;
  let author = req.body.author;
  var file = req.files.file;
  let uploadPath ="upload/" + file.name;
  let err = false;

  if (req.files) {
    console.log(req.files);
    var filename = file.name;
    console.log(filename);

    file.mv(uploadPath, (err) => {
      if (err) {
        res.send(err);
      }
    });
  }
  if (name.length === 0 || author.length === 0) {
    error = true;
    // set flash msg
    req.flash("error", "Please enter name and author");
    // render to add.ejs
    res.render("books/add", {
      name: name,
      author: author,
      file_name: filename,
    });
  }

  //insert data
  if (!err) {
    let form_data = {
      name: name,
      author: author,
      file_name: filename,
    };

    // insert query
    dbCon.query("INSERT INTO books SET ?", form_data, (err, result) => {
      if (err) {
        req.flash("error", err);

        res.render("books/add", {
          name: form_data.name,
          author: form_data.author,
          file_name: form_data.file_name,
        });
      } else {
        req.flash("success", "books success added");
        // res.redirect("/books");
      }
    });
  }
});

// display edit books page
router.get("/edit/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query("SELECT * FROM books WHERE id =" + id, (err, rows, fields) => {
    if (rows.length <= 0) {
      req.flash("error", "Books not found with id =" + id);
      res.redirect("/books");
    } else {
      res.render("books/edit", {
        title: "edit book",
        id: rows[0].id,
        name: rows[0].name,
        author: rows[0].author,
      });
    }
  });
});

router.post("/update/:id", (req, res, next) => {
  let id = req.params.id;
  let name = req.body.name;
  let author = req.body.author;
  let error = false;

  if (name.length === 0 || author.length === 0) {
    error = true;
    // set flash msg
    req.flash("error", "please enter name and author");
    // render to edit.ejs
    res.render("books/edit", {
      id: req.params.id,
      name: name,
      author: author,
    });
  }

  if (!error) {
    let form_data = {
      name: name,
      author: author,
    };

    // update query
    dbCon.query(
      "UPDATE books SET ? WHERE id = " + id,
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", "err");

          res.render("/books/edit", {
            id: req.params.id,
            name: form_data.name,
            author: form_data.author,
          });
        } else {
          req.flash("success", "success");
          // res.redirect("/books");
        }
      }
    );
  }
});

router.get("/delete/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query("DELETE FROM books WHERE id = " + id, (err, result) => {
    if (err) {
      req.flash("error", err);
      res.redirect("/books");
    } else {
      req.flash("success", "delete success");
      res.redirect("/books");
    }
  });
});

module.exports = router;
