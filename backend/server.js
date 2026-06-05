import express from 'express';
import cors from 'cors';
import connectDb from './database/mysql.js';
import path from "path";
import multer from 'multer';

const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const __dirname = process.cwd();
app.use(express.static(
    path.join(__dirname, '..', 'frontend')
));

app.use("/uploads", express.static("uploads")); 

async function startServer() {
    const db = await connectDb();
    console.log("Database connection established, starting server...");

    app.get('/departments', async (req, res) => {
        try{
            const [departments] = await db.query("SELECT * FROM departments");
            res.json(departments);
        } catch (error) {
            console.error("Error fetching departments:", error);
            res.status(500).json({ error: "Failed to fetch departments" });
        }
    });

    app.post('/departments', async (req, res) => {
        const { department_name, description } = req.body;
        try {
            const [result] = await db.query("INSERT INTO departments (department_name, description) VALUES (?, ?)", [department_name, description]);
            res.status(201).json({ id: result.insertId, department_name, description });
        } catch (error) {
            console.error("Error creating department:", error);
            res.status(500).json({ error: "Failed to create department" });
        }
    });

    app.get('/departments/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const [departments] = await db.query("SELECT * FROM departments WHERE department_id = ?", [id]);
            if (departments.length === 0) {
                return res.status(404).json({ error: "Department not found" });
            }
            res.json(departments[0]);
        } catch (error) {
            console.error("Error fetching department:", error);
            res.status(500).json({ error: "Failed to fetch department" });
        }
    });

    app.put('/departments/:id', async(req, res)=>{
        const {id} = req.params;
        const {department_name, description} = req.body;

        try{
            const [result] = await db.query("UPDATE departments SET department_name = ?, description = ? WHERE department_id = ?", [department_name, description, id]);
            if(result.affectedRows === 0){
                return res.status(404).json({error: "Department not found"});
            }
            res.json({message: "Department updated successfully"});
        } catch(error){
            console.error("Error updating department:", error);
            res.status(500).json({error: "Failed to update department"});
        }
    })

    app.delete('/departments/:id', async(req, res)=>{
        const {id} = req.params;

        try {
            await db.execute('DELETE FROM departments WHERE department_id = ?', [id]);
            res.json({ message: 'Department deleted successfully' });
        } catch (error) {
            console.error("Error deleting department:", error);
            res.status(500).json({ error: "Failed to delete department" });
        }
    })

    //Employees
    app.get('/employeepage', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'employee.html'));
    });

    app.get('/employees', async (req, res) => {
        try{
            const [employees] = await db.query("select d.department_id, d.department_name, e.employee_id, e.fullname, e.email, e.phone_number,e.department_id, e.profile_image, e.position from departments d join employees e where d.department_id = e.department_id;");
            res.json(employees);
        } catch (error) {
            console.error("Error fetching employees:", error);
            res.status(500).json({ error: "Failed to fetch employees" });
        }
    });

    app.post('/employees', upload.single('profile_image'), async (req, res) => {
        const { fullname, email, phone_number, department_id, position } = req.body;
        const profile_image = req.file ? req.file.filename : null;
        try {
            const [result] = await db.query("INSERT INTO employees (fullname, email, phone_number, department_id, profile_image, position) VALUES (?, ?, ?, ?, ?, ?)", [fullname, email, phone_number, department_id, profile_image, position]);
            res.status(201).json({ id: result.insertId, fullname, email, phone_number, department_id, profile_image, position });
        } catch (error) {
            console.error("Error creating employee:", error);
            res.status(500).json({ error: "Failed to create employee" });
        }
    });

    app.get('/employees/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const [employees] = await db.query("SELECT d.department_id, d.department_name, e.employee_id, e.fullname, e.email, e.phone_number, e.profile_image, e.position FROM departments d JOIN employees e ON d.department_id = e.department_id WHERE e.employee_id = ?", [id]);
            if (employees.length === 0) {
                return res.status(404).json({ error: "Employee not found" });
            }
            res.json(employees[0]);
        } catch (error) {
            console.error("Error fetching employee:", error);
            res.status(500).json({ error: "Failed to fetch employee" });
        }
    });

    app.put('/employees/:id', upload.single('profile_image'), async(req, res)=>{
        const {id} = req.params;
        const {fullname, email, phone_number, department_id, position} = req.body;
        const profile_image = req.file ? req.file.filename : null;

        try{
            let query = "UPDATE employees SET fullname = ?, email = ?, phone_number = ?, department_id = ?, position = ?";
            const params = [fullname, email, phone_number, department_id, position];
            if(profile_image){
                query += ", profile_image = ?";
                params.push(profile_image);
            }
            query += " WHERE employee_id = ?";
            params.push(id);

            await db.query(query, params);
            res.json({ message: 'Employee updated successfully' });
        } catch (error) {
            console.error("Error updating employee:", error);
            res.status(500).json({ error: "Failed to update employee" });
        }
    });

    app.delete('/employees/:id', async(req, res)=>{
        const {id} = req.params;

        try {
            await db.execute('DELETE FROM employees WHERE employee_id = ?', [id]);
            res.json({ message: 'Employee deleted successfully' });
        } catch (error) {
            console.error("Error deleting employee:", error);
            res.status(500).json({ error: "Failed to delete employee" });
        }
    });

    app.listen(4000, () => {
        console.log('Server is running on port 4000');
    });

}

startServer();
