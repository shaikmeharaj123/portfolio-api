  const mongoose = require("mongoose");
  const slugify = require("slugify");

  const blogSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      slug: {
        type: String,
        unique: true,
        lowercase: true,
      },

      category: {
        type: String,
        required: true,
      },

      excerpt: {
        type: String,
        required: true,
      },

      content: {
        type: String,
        default: "",
      },

      readTime: {
        type: String,
        default: "5 min read",
      },

      date: {
        type: String,
      },

      coverImage: {
        type: String,
        default: "",
      },

      tags: [
        {
          type: String,
        },
      ],

      published: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

  blogSchema.pre("save", function () {
    if (this.isModified("title")) {
      this.slug = slugify(this.title, {
        lower: true,
        strict: true,
      });
    }

  });

  blogSchema.index({ category: 1 });

  module.exports = mongoose.model("Blog", blogSchema);
