const ensureRoleScopedAuthIndexes = async (User) => {
  const users = User.collection;
  const invalidRoleCount = await users.countDocuments({
    role: { $exists: true, $nin: ["customer", "provider"] },
  });
  const invalidEmailCount = await users.countDocuments({
    Email: { $not: { $type: "string" } },
  });
  if (invalidRoleCount || invalidEmailCount) {
    throw new Error("Cannot migrate account indexes: user records need valid roles and email addresses");
  }

  const duplicateGroups = await users.aggregate([
    {
      $group: {
        _id: {
          role: { $toLower: { $ifNull: ["$role", "customer"] } },
          Email: { $toLower: "$Email" },
        },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ]).toArray();
  if (duplicateGroups.length) {
    throw new Error("Cannot migrate account indexes: duplicate email found within one account type");
  }

  const duplicatePhones = await users.aggregate([
    { $match: { phone: { $type: "string" } } },
    {
      $group: {
        _id: { role: { $toLower: { $ifNull: ["$role", "customer"] } }, phone: "$phone" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ]).toArray();
  if (duplicatePhones.length) {
    throw new Error("Cannot migrate account indexes: duplicate phone number found within one account type");
  }

  const indexes = await users.indexes();
  const migrationComplete = indexes.some((index) => index.name === "Email_role_unique") &&
    indexes.some((index) => index.name === "phone_role_unique") &&
    indexes.some((index) => index.name === "username_1");
  for (const index of indexes) {
    const fields = Object.keys(index.key || {});
    if (index.unique && fields.length === 1 &&
        (["Email", "phone"].includes(fields[0]) || (fields[0] === "username" && !migrationComplete))) {
      await users.dropIndex(index.name);
    }
  }

  const scopedRole = { $toLower: { $ifNull: ["$role", "customer"] } };
  const scopedEmail = { $toLower: "$Email" };
  await users.updateMany({
    $expr: {
      $or: [
        { $ne: ["$Email", scopedEmail] },
        { $ne: ["$role", scopedRole] },
        { $ne: ["$username", { $concat: [scopedRole, ":", scopedEmail] }] },
      ],
    },
  }, [
    {
      $set: {
        role: { $toLower: { $ifNull: ["$role", "customer"] } },
        Email: { $toLower: "$Email" },
      },
    },
    { $set: { username: { $concat: ["$role", ":", "$Email"] } } },
  ]);

  await users.createIndex({ Email: 1, role: 1 }, { unique: true, name: "Email_role_unique" });
  await users.createIndex(
    { phone: 1, role: 1 },
    {
      unique: true,
      partialFilterExpression: { phone: { $type: "string" } },
      name: "phone_role_unique",
    },
  );
  await users.createIndex({ username: 1 }, { unique: true, name: "username_1" });
};

module.exports = ensureRoleScopedAuthIndexes;
