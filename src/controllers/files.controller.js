import XLSX from "xlsx";
import path from 'path';

export const UploadXLSX = (req, res) => {
    try {
        const { name } = req.params;

        if (!name){
            return res.status(400).json({ error: "Name is required" });
        }

        const filePath = path.join(process.cwd(), 'uploads', name);
        const workbook = XLSX.readFile(filePath);
        let jsonData = {};

        workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            jsonData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
        });

        res.json(jsonData);
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Error processing file", details: error.message });
    }
}