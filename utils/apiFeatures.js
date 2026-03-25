class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  // Metod for filtering
  filter() {
    //1a. Filtering

    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // console.log(queryObj);
    // req.query = { duration: 5, difficulty: 'easy' }
    // 1b. Advance Filtering
    // // Executing query
    let querySring = JSON.stringify(queryObj);
    querySring = querySring.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    this.query = this.query.find(JSON.parse(querySring));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      console.log(this.queryString.sort);
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy); // sort('price ratingsAverage') incase the price are the same
      // sort(price ratingsAverage) incase the price are the same
    } else {
      this.query = this.query.sort('-createdAt'); //this is the default sort
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // We are excluding this particular field
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1; // converting it to a number and setting the default to 1
    const limit = this.queryString.limit * 1 || 100; // results per page
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit); // page 1: 1-10, page 2: 11 - 20 page 3: 21 = 30

    return this;
  }
}
module.exports = APIFeatures;
