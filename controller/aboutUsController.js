const {
  AnnouncingDhandaFirstModel,
  BharatFirstUnfoldingModel,
} = require("../model/aboutUsSchema");

// ========================= AnnouncingDhandaFirst APIs =========================

// Add
exports.addAnnouncingDhandaFirst = async (req, res) => {
  try {
    const { text } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    if (!text) {
      return res.status(400).json({ msg: "Text is required" });
    }

    const newRecord = new AnnouncingDhandaFirstModel({ text, image });
    await newRecord.save();

    return res
      .status(201)
      .json({ msg: "AnnouncingDhandaFirst Created Successfully", newRecord });
  } catch (err) {
    console.error("Failed to create AnnouncingDhandaFirst", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Get All
exports.getAnnouncingDhandaFirst = async (req, res) => {
  try {
    const records = await AnnouncingDhandaFirstModel.find({});
    return res.status(200).json(records);
  } catch (err) {
    console.error("Failed to fetch AnnouncingDhandaFirst", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Update
exports.updateAnnouncingDhandaFirst = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (!id) return res.status(400).json({ msg: "ID is required" });

    const updateFields = {};
    if (text) updateFields.text = text;
    if (image) updateFields.image = image;

    const updatedRecord = await AnnouncingDhandaFirstModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedRecord)
      return res.status(404).json({ msg: "Record not found" });

    return res
      .status(200)
      .json({ msg: "AnnouncingDhandaFirst Updated", updatedRecord });
  } catch (err) {
    console.error("Failed to update AnnouncingDhandaFirst", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Delete
exports.deleteAnnouncingDhandaFirst = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AnnouncingDhandaFirstModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: "Record not found" });

    return res
      .status(200)
      .json({ msg: "AnnouncingDhandaFirst Deleted Successfully" });
  } catch (err) {
    console.error("Failed to delete AnnouncingDhandaFirst", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// ========================= BharatFirstUnfolding APIs =========================

// Add
exports.addBharatFirstUnfolding = async (req, res) => {
  try {
    const { text } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    if (!text) {
      return res.status(400).json({ msg: "Text is required" });
    }

    const newRecord = new BharatFirstUnfoldingModel({ text, image });
    await newRecord.save();

    return res
      .status(201)
      .json({ msg: "BharatFirstUnfolding Created Successfully", newRecord });
  } catch (err) {
    console.error("Failed to create BharatFirstUnfolding", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Get All
exports.getBharatFirstUnfolding = async (req, res) => {
  try {
    const records = await BharatFirstUnfoldingModel.find({});
    return res.status(200).json(records);
  } catch (err) {
    console.error("Failed to fetch BharatFirstUnfolding", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Update
exports.updateBharatFirstUnfolding = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (!id) return res.status(400).json({ msg: "ID is required" });

    const updateFields = {};
    if (text) updateFields.text = text;
    if (image) updateFields.image = image;

    const updatedRecord = await BharatFirstUnfoldingModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedRecord)
      return res.status(404).json({ msg: "Record not found" });

    return res
      .status(200)
      .json({ msg: "BharatFirstUnfolding Updated", updatedRecord });
  } catch (err) {
    console.error("Failed to update BharatFirstUnfolding", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Delete
exports.deleteBharatFirstUnfolding = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BharatFirstUnfoldingModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: "Record not found" });

    return res
      .status(200)
      .json({ msg: "BharatFirstUnfolding Deleted Successfully" });
  } catch (err) {
    console.error("Failed to delete BharatFirstUnfolding", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};


// const OrganiserModal = require('../model/aboutUsSchema')

// exports.addOrganisers= async (req, res)=>{

//     const {announcingDhandaFirst, bharatFirstUnfolding} = req.body;

//     if(!announcingDhandaFirst || !bharatFirstUnfolding){
//         return res.status(400).json({msg:"All Fields are Required"})
//     };
//     try{
//         const records = await OrganiserModal.create({
//             announcingDhandaFirst: announcingDhandaFirst,
//             bharatFirstUnfolding: bharatFirstUnfolding
//         })
//         console.log('records',records)
//        return res.status(201).json({msg:"Organiser is Succesfully Created"})
//     }catch(err){
//         console.err(err,"Failed to create")
//         return res.status(500).json({msg:"Internal Server Error"})
//     }

// }

// exports.deleteOrganisers = async (req,res)=>{
//     const {id} = req.params;
//     if(!id){
//         return res.status(400).json({msg:"ID is required"})
//     }
//     try{

//         const deleteRecord = await OrganiserModal.findByIdAndDelete(id)
//         if(!deleteRecord){
//             return res.status(404).json({msg:"Record not Found"})
//         }
//         return res.status(200).json({msg:"Record is deleted SuccessFully"})

//     }catch(err){
//         console.err(err,"Failed to Delete")
//         return res.status(500).json({msg:"Internal Server Error"})
//     }
// }

// exports.editOrganisers = async (req,res)=>{
//     const {announcingDhandaFirst, bharatFirstUnfolding} = req.body;
//     const {id} = req.params;
//     if(!id){
//         return res.status(400).json({msg:"ID is Required"})
//     }
//     console.log('dataaa',announcingDhandaFirst,bharatFirstUnfolding)
//     const updatedOrganisers= {}
//     if(announcingDhandaFirst) updatedOrganisers.announcingDhandaFirst = announcingDhandaFirst;
//     if(bharatFirstUnfolding) updatedOrganisers.bharatFirstUnfolding = bharatFirstUnfolding;

//     try{
//         const updatedRecord = await OrganiserModal.findByIdAndUpdate(
//             id,
//             {$set:updatedOrganisers},
//             {new: true}
//         )
//         if(!updatedRecord){
//             return res.status(404).json({msg:"Organiser not Found"})
//         }
//         return res.status(200).json({msg:"Organiser is updated Successfully",updatedRecord})

//     }catch(err){
//            console.err(err,"Failed to Update Organiser")
//         return res.status(500).json({msg:"Internal Server Error"})
//     }

// }

// exports.getOrganisers = async (req, res)=>{
//     try{
//         const record = await OrganiserModal.find({});
//         if(!record){
//             return res.status(404).json({msg:"No Record Found"})
//         }
//         return res.status(200).json(record)

//     }catch(err){
//          console.error('No Data',err)
//         return res.status(500).json({ msg:'Data not fetch' })
//     }
// }