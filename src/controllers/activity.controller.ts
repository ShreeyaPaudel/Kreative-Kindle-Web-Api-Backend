import { Request, Response } from "express";
import Activity from "../models/activity.model";

// GET /api/activities — all activities (public)
export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const { category, age } = req.query;
    const filter: any = {};
    if (category) filter.category = category;
    if (age)      filter.age      = age;

    const activities = await Activity.find(filter).sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

// GET /api/activities/:id — single activity (public)
export const getActivityById = async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json(activity);
  } catch {
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};

// POST /api/admin/activities — create (admin only)
export const createActivity = async (req: Request, res: Response) => {
  try {
    const { title, category, age, duration, description, image, materials, steps } = req.body;
    if (!title || !category || !age || !duration || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const activity = await Activity.create({
      title, category, age, duration, description,
      image:     image     || "",
      materials: Array.isArray(materials) ? materials : [],
      steps:     Array.isArray(steps)     ? steps     : [],
    });
    res.status(201).json({ message: "Activity created", data: activity });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to create activity" });
  }
};

// PUT /api/admin/activities/:id — update (admin only)
export const updateActivity = async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ message: "Activity updated", data: activity });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to update activity" });
  }
};

// DELETE /api/admin/activities/:id — delete (admin only)
export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ message: "Activity deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete activity" });
  }
};

// POST /api/admin/activities/seed — seed initial 9 activities
export const seedActivities = async (req: Request, res: Response) => {
  try {
    const count = await Activity.countDocuments();
    if (count > 0) return res.json({ message: `Already seeded (${count} activities exist)` });

    const activities = [
      { title: "Rainbow Watercolour Art", category: "Art", age: "Ages 3–6", duration: "30 min", description: "Create a beautiful rainbow using watercolour paints and simple brush techniques.", image: "/images/rainbowart.png", materials: ["Watercolour paints","Paintbrush","White paper","Cup of water","Paper towel"], steps: ["Lay paper flat on table","Wet brush and dip into first colour","Paint a curved arc across paper","Rinse brush, pick next colour","Repeat for all colours of the rainbow","Let dry completely"] },
      { title: "Counting Caterpillar", category: "Math", age: "Ages 2–5", duration: "20 min", description: "Build a caterpillar using numbered circles to practice counting and sequencing.", image: "/images/countingcatterpillar.png", materials: ["Coloured paper circles","Marker","Glue or tape","Googly eyes (optional)"], steps: ["Write numbers 1–10 on circles","Arrange circles in order","Glue together to form caterpillar body","Add googly eyes to first circle","Count aloud as you point to each segment"] },
      { title: "Story Time Fun", category: "Reading", age: "Ages 3–6", duration: "25 min", description: "An interactive story session with questions and creative retelling.", image: "/images/storytime.png", materials: ["Picture book","Comfortable seating","Optional: drawing paper and crayons"], steps: ["Choose a colourful picture book","Read aloud with expressive voice","Pause to ask 'What do you think happens next?'","Discuss characters and feelings","Ask child to retell story in their words","Optional: draw a favourite scene"] },
      { title: "Build a Robot", category: "Science", age: "Ages 5–9", duration: "45 min", description: "Use recycled materials to build a creative robot and learn about engineering.", image: "/images/buildarobot.png", materials: ["Cardboard boxes","Toilet roll tubes","Foil","Glue","Markers","Stickers"], steps: ["Collect recycled materials","Plan robot design on paper","Build the body using large box","Attach tubes as arms and legs","Decorate with foil and markers","Name your robot and describe its powers"] },
      { title: "Nature Collage", category: "Art", age: "Ages 4–7", duration: "35 min", description: "Collect leaves, petals and twigs to create a beautiful nature collage.", image: "/images/naturecollage.png", materials: ["Leaves","Petals","Twigs","Glue","Paper or cardboard","Crayons (optional)"], steps: ["Go on a nature walk to collect items","Arrange items on paper","Glue down starting with largest pieces","Fill gaps with smaller items","Allow to dry","Write the names of items found"] },
      { title: "DIY Volcano", category: "Science", age: "Ages 6–10", duration: "40 min", description: "Build a baking soda and vinegar volcano and learn about chemical reactions.", image: "/images/diyvolcano.png", materials: ["Baking soda","Vinegar","Food colouring","Clay or playdough","Tray or container","Dish soap (optional)"], steps: ["Build volcano shape using clay around a cup","Place on tray","Add 3 tablespoons baking soda inside cup","Add a few drops of food colouring","Pour in vinegar and watch it erupt!","Repeat and experiment with amounts"] },
      { title: "Shape Painting", category: "Art", age: "Ages 2–5", duration: "20 min", description: "Use shape cutouts as stencils to create colourful shape artwork.", image: "/images/shapepainting.png", materials: ["Shape cutouts (circle, square, triangle)","Paint","Sponge or brush","Paper"], steps: ["Cut out basic shapes from cardboard","Lay shape on paper","Dab paint around or inside shape","Lift shape carefully","Repeat with different shapes and colours","Label each shape when dry"] },
      { title: "Number Puzzles", category: "Math", age: "Ages 4–7", duration: "25 min", description: "Match number cards with dot patterns to build number recognition skills.", image: "/images/numberpuzzle.png", materials: ["Number cards 1–10","Dot pattern cards","Optional: stickers for dots"], steps: ["Create or print number cards 1–10","Create matching dot pattern cards","Mix cards up on table","Ask child to match number to correct dots","Time them for added challenge","Discuss which numbers were tricky"] },
      { title: "Alphabet Hunt", category: "Reading", age: "Ages 3–6", duration: "20 min", description: "Search the house or yard for objects that start with each letter of the alphabet.", image: "/images/alphabethunt.png", materials: ["Alphabet list or chart","Pencil","Optional: camera or phone for photos"], steps: ["Print or write out the alphabet","Walk around the house or yard","Find an object for each letter","Write or draw the object next to the letter","Take photos if available","Review findings together at the end"] },
    ];

    await Activity.insertMany(activities);
    res.json({ message: `Seeded ${activities.length} activities successfully` });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Seed failed" });
  }
};