const Data = require('../model/homePageSchema');

exports.uploadData = async (req, res) => {
  const { key, title, name, designation, description, linkedin_Id } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  const newData = new Data({ key, title, name, image, designation, description, linkedin_Id });
  await newData.save();
  res.status(201).json({ message: 'Data uploaded successfully' });
};

// exports.getData = async (req, res) => {
//   const allData = await Data.find();
//   const grouped = {};

//   allData.forEach(item => {
//     if (!grouped[item.key]) grouped[item.key] = [];
//     const obj = { image: item.image };
//     if (item.title) obj.title = item.title;
//     if (item.name) obj.name = item.name;
//     if (item.designation) obj.designation = item.designation;
//     if (item.description) obj.description = item.description;
//     grouped[item.key].push(obj);
//   });

//   res.json({ data: grouped });
// };

exports.getData = async (req, res) => {
  try {
    const allData = await Data.find();
    const grouped = {};
    console.log('data', allData)
    allData.forEach(item => {
      console.log('item',item)
      if (!grouped[item.key]) grouped[item.key] = [];
      const obj = { image: item.image };
      if(item._id) obj._id = item._id;
      if (item.title) obj.title = item.title;
      if (item.name) obj.name = item.name;
      if (item.designation) obj.designation = item.designation;
      if (item.description) obj.description = item.description;
      if (item.linkedin_Id) obj.linkedin_Id = item.linkedin_Id;
      grouped[item.key].push(obj);
    });

    res.json({ data: grouped });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
};

exports.editData = async (req, res) => {
  try {
    const { id } = req.params; // ID from URL
    const { key, title, name, designation, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updatedData = await Data.findByIdAndUpdate(
      id,
      {
        ...(key && { key }),
        ...(title && { title }),
        ...(name && { name }),
        ...(designation && { designation }),
        ...(description && { description }),
        ...(image && { image }),
        ...(linkedin_Id && { linkedin_Id })
      },
      { new: true } // return updated document
    );

    if (!updatedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data updated successfully', data: updatedData });
  } catch (error) {
    res.status(500).json({ message: 'Error updating data', error });
  }
};

// Delete
exports.deleteData = async (req, res) => {
  try {
    const { id } = req.params; // ID from URL
    const deletedData = await Data.findByIdAndDelete(id);

    if (!deletedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting data', error });
  }
};
