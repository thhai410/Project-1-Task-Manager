const Models = require("../models");

// Hàm tìm tất cả documents khớp với query, dùng cho việc lấy danh sách users, projects, tasks (ví dụ: UC-11 xem báo cáo, UC-05 thêm thành viên)
const find = async (modelDb, queryObj) =>
  await Models[modelDb].find(queryObj).exec();

// Hàm tìm một document duy nhất, dùng cho việc lấy chi tiết user, project, task (ví dụ: UC-01 đăng nhập kiểm tra user, UC-06 tạo task kiểm tra trùng)
const findOne = async (modelDb, queryObj) =>
  await Models[modelDb].findOne(queryObj).exec();

// Hàm tìm một document và chọn fields cụ thể, dùng để tối ưu dữ liệu trả về (ví dụ: lấy profile user chỉ name và email)
const findOneAndSelect = async (modelDb, queryObj, selectQuery) =>
  await Models[modelDb].findOne(queryObj).select(selectQuery).exec();

// Hàm tạo document mới, dùng cho đăng ký user (UC-02), tạo project (UC-04), tạo task (UC-06), thêm comment (UC-09)
const insertNewDocument = async (modelDb, storeObj) => {
  let data = new Models[modelDb](storeObj);
  return await data.save();
};

// Hàm cập nhật document với $set, dùng cho cập nhật profile, tiến độ task (UC-08), thay đổi trạng thái project
const updateDocument = async (modelDb, updateQuery, setQuery) =>
  await Models[modelDb].findOneAndUpdate(
    updateQuery,
    { $set: setQuery },
    { new: true }
  );

// Hàm cập nhật tùy chỉnh (có thể dùng operators như $inc, $push), dùng cho tăng tiến độ %, hoặc các update phức tạp (ví dụ: UC-08 cập nhật tiến độ)
const customUpdate = async (modelDb, updateQuery, setQuery) =>
  await Models[modelDb].updateOne(updateQuery, setQuery);

// Hàm thêm phần tử vào mảng không trùng (ví dụ: thêm member vào project (UC-05), thêm file/comment vào task (UC-09, UC-10))
const pushIntoArray = async (modelDb, updateQuery, setQuery) =>
  await Models[modelDb].findOneAndUpdate(
    updateQuery,
    { $addToSet: setQuery },
    { new: true }
  );

// Hàm xóa document, dùng cho xóa project (UC-14), xóa user, xóa task
const deleteDocument = async (modelDb, deleteQuery) =>
  await Models[modelDb].deleteOne(deleteQuery);

// Hàm tìm một document và populate relations, dùng cho lấy task với assignee (UC-07), project với members (UC-05)
const findOneAndPopulate = async (
  modelDb,
  searchQuery,
  populateQuery,
  selectQuery
) =>
  await Models[modelDb]
    .findOne(searchQuery)
    .populate({ path: populateQuery, select: selectQuery })
    .lean();

// Hàm tìm nhiều documents và populate, dùng cho danh sách tasks với assignees (Kanban board, UC-13)
const findAndPopulate = async (
  modelDb,
  searchQuery,
  populateQuery,
  selectQuery
) =>
  await Models[modelDb]
    .find(searchQuery)
    .populate({ path: populateQuery, select: selectQuery })
    .lean();

// Hàm tìm với populate, sort, skip, limit, dùng cho phân trang tasks/projects (dashboard UC-11, filter theo status/priority)
const findPopulateSortAndLimit = async (
  modelDb,
  searchQuery,
  populateQuery,
  selectQuery,
  sortedBy,
  skip,
  limit
) =>
  await Models[modelDb]
    .find(searchQuery)
    .populate({ path: populateQuery, select: selectQuery })
    .sort(sortedBy)
    .skip(skip)
    .limit(limit)
    .lean();

// Hàm tìm và populate nested (đa cấp), dùng cho task populate comments và authors (UC-09)
const findAndPopulateNested = async (modelDb, searchQuery, populate) =>
  await Models[modelDb].find(searchQuery).populate(populate).lean();

// Hàm aggregation, dùng cho báo cáo thống kê (UC-11: count tasks overdue, per member, biểu đồ)
const getAggregate = async (modelDb, aggregateQuery) =>
  await Models[modelDb].aggregate(aggregateQuery);

// Hàm tìm với limit, sort, skip (phân trang cơ bản), dùng cho danh sách users/projects (UC-03 quản lý user)
const getDataWithLimit = async (modelDb, searchQuery, sortedBy, skip, limit) =>
  await Models[modelDb]
    .find(searchQuery)
    .sort(sortedBy)
    .skip(skip)
    .limit(limit)
    .exec();

// Hàm tìm với select fields, limit, sort, skip, dùng cho dashboard lấy data tối ưu (UC-11)
const getDataSelectWithLimit = async (
  modelDb,
  searchQuery,
  selectQuery,
  sortedBy,
  skip,
  limit
) =>
  await Models[modelDb]
    .find(searchQuery)
    .select(selectQuery)
    .sort(sortedBy)
    .skip(skip)
    .limit(limit)
    .exec();

// Hàm mới thêm: Đếm số documents khớp query, dùng cho dashboard (số tasks overdue, tasks per member - UC-11)
const countDocuments = async (modelDb, queryObj) =>
  await Models[modelDb].countDocuments(queryObj).exec();

// Hàm mới thêm: Tìm và sort theo field cụ thể, dùng cho Kanban sort tasks theo priority/deadline (UC-13)
const findAndSort = async (modelDb, searchQuery, sortedBy) =>
  await Models[modelDb].find(searchQuery).sort(sortedBy).exec();

// Hàm mới thêm: Update nhiều documents (multi update), dùng cho batch update status tasks nếu cần (mở rộng UC-08)
const updateMany = async (modelDb, updateQuery, setQuery) =>
  await Models[modelDb].updateMany(updateQuery, setQuery);

module.exports = {
  find,
  findOne,
  insertNewDocument,
  updateDocument,
  deleteDocument,
  findOneAndPopulate,
  findAndPopulate,
  pushIntoArray,
  findAndPopulateNested,
  customUpdate,
  getAggregate,
  getDataWithLimit,
  getDataSelectWithLimit,
  findOneAndSelect,
  findPopulateSortAndLimit,
  countDocuments,
  findAndSort,
  updateMany,
};