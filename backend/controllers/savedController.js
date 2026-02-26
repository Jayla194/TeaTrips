// handles saving and unsaving locations for logged-in users

const db = require("../config/db");

exports.saveLocation = async (req,res)=>{
    const userId = req.user.user_id;
    const locationId = Number(req.params.locationId);

    if(!Number.isInteger(locationId)){
        return res.status(400).json({ message: "Invalid locationId" });
    }

    try {
        const result = await db.query('INSERT INTO saved_locations (user_id, location_id) VALUES (?,?) ON DUPLICATE KEY UPDATE created_at = created_at', [userId, locationId])
        if (!result){
            return res.status(500).json({ message: "Error saving location" });
        } else{
            return res.status (201).json({message:"Location Saved"});
        }
    }catch (err){
        console.log(err);
        return res.status(500).json({ message: "Error saving location" });
    }
};

exports.unsaveLocation = async (req,res) => {
    const userId = req.user.user_id;
    const locationId = Number(req.params.locationId);

    if(!Number.isInteger(locationId)){
        return res.status(400).json({message:"Invalid locationId"});
    }
    try{
        const [result] = await db.query('DELETE FROM saved_locations WHERE user_id = ? AND location_id = ?',[userId,locationId]);
        if (result.affectedRows === 0){
            return res.status(404).json({messgae:"Location not saved"});
        }
        return res.json({message:"Location removed"});
    }catch(err){
        return res.status(500).json({message: "Error removing location"});
    }
};

exports.getSavedLocations = async (req,res) => {
    const userId = req.user.user_id;

    try{
        const sql = `
        SELECT loc.*
        FROM saved_locations save
        JOIN locations loc ON loc.id = save.location_id
        WHERE save.user_id = ?
        ORDER BY save.created_at DESC`
        const [rows] = await db.query(sql, [userId]);
        return res.json(rows);
    } catch (err){
        console.log(err);
        return res.status(500).json({message:"Error fetching saved locations"});
    }
}