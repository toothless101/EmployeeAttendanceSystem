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
        const profile_image = req.file ? req.file.filename : null; //condition, if the user provided an image, use the filename, otherwise set to null
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

    //attendance
    app.get('/attendance', async(req, res)=>{
        try {
            const [attendance] = await db.query('select e.employee_id, e.fullname, e.position, ar.attendance_date, ar.time_in, ar.time_out, ar.status from employees e join attendance_record ar WHERE e.employee_id = ar.employee_id AND attendance_date = CURDATE()');
            res.json(attendance);
        } catch (error) {
            console.error("Error fetching attendance records:", error);
            res.status(500).json({ error: "Failed to fetch attendance records" });
        }
    });

    app.get('/attendance/search', async(req, res)=>{
        const keyword = req.query.keyword;

        try{
            const [attendance] = await db.query('select employee_id, fullname from employees where fullname like ?', [`%${keyword}%`]);
            res.json(attendance);
        }catch(error){
            console.error("Error searching attendance records:", error);
            res.status(500).json({ error: "Failed to search attendance records" });
        }
    });

    //official time in for attendance (8:00 AM)
    const OFFICIAL_TIME_IN = "08:00:00";

    //record attendance - time_in
    app.post('/attendance/time_in', async(req, res)=>{
        const {employee_id} = req.body;

        try{
            const [existing] = await db.query('SELECT * FROM attendance_record WHERE employee_id = ? AND attendance_date = CURDATE()', [employee_id]);

            if(existing.length > 0){
                return res.json({ message: "Attendance already recorded for today" });
                console.log('Attendance already recorded for today');
            }

            const time_in = new Date();
            const currentTime = time_in.toTimeString().split(' ')[0];

            const status = currentTime > OFFICIAL_TIME_IN ? "Late" : "Present"; 

            await db.query('INSERT INTO attendance_record(employee_id, attendance_date, time_in, status) VALUES (?, CURDATE(), ?, ?)', [employee_id, currentTime, status]);
            res.json({ message: "Time in recorded successfully" });

        } catch(error){
            console.error("Error recording time in:", error);
            res.status(500).json({ message: "Failed to record time in" });
        }
            
    })

    app.post('/attendance/time_out', async(req, res)=>{
        const {employee_id} = req.body;

        try{
           const [existing] = await db.query('SELECT * FROM attendance_record WHERE employee_id = ? AND time_out IS NOT NULL AND attendance_date = CURDATE()', [employee_id]);

            if(existing.length > 0){
                return res.json({ message: "Attendance already recorded for today" });
                console.log('Attendance already recorded for today');
            }

            const timeOut = new Date();
            const currentHour = timeOut.getHours();

            if(currentHour < 17){
                return res.status(400).json({
                    message: 'Time Out is only allowed after 5:00 PM'
                });
            }

            await db.query('UPDATE attendance_record SET time_out = ? WHERE employee_id = ? AND attendance_date = CURDATE()', [timeOut, employee_id]);
            res.json({ message: "Time out recorded successfully" });
        } catch(error){
            console.error("Error recording time out:", error);
            res.status(500).json({ message: "Failed to record time out" });
        }
    });

    app.post('/attendance/leave', async(req, res)=>{
        const {employee_id} = req.body;

        try{
           const [existing] = await db.query('SELECT * FROM attendance_record WHERE employee_id = ? AND status = "Leave" AND attendance_date = CURDATE()', [employee_id]);

            if(existing.length > 0){
                return res.json({ message: "Employee Status Already Recorded" });
                console.log('Employee Status Already Recorded');
            }

            const time_out = new Date();
            const currentTime = time_out.toTimeString().split(' ')[0];  

            await db.query('INSERT INTO attendance_record(employee_id, attendance_date, status) VALUES (?, CURDATE(), "Leave")', [employee_id]);
            res.json({ message: "Leave recorded successfully" });
        } catch(error){
            console.error("Error recording leave status:", error);
            res.status(500).json({ message: "Failed to record leave status" });
        }
    });

    app.get('/attendance/statistics/:employee_id', async(req, res) =>{
        const {employee_id} = req.params;
        try{
            const [rows] = await db.query(`SELECT DATEDIFF(CURDATE(), hire_date) + 1 AS total_days FROM employees WHERE employee_id = ?`, [employee_id]);
            console.log(rows)
            const employee = rows[0];
            const [[present]] = await db.query(`SELECT COUNT(*) as total FROM attendance_record WHERE employee_id = ? AND status = 'Present'`, [employee_id]);
            const [[late]] = await db.query(`SELECT COUNT(*) as total FROM attendance_record WHERE employee_id = ? AND status = 'Late'`, [employee_id]);
            const [[leave]] = await db.query(`SELECT COUNT(*) as total FROM attendance_record WHERE employee_id = ? AND status = 'Leave'`, [employee_id]);

            //computation for update (including weekend)
            const absent = Math.max(0, employee.total_days - present.total - late.total - leave.total);

            res.json({present: present.total, late: late.total, leave: leave.total, absent: absent});
        }catch(error){
            res.status(500).json('Error retrieving employee statistics');
            console.error(error);
        }
    });

    app.get('/attendance/report', async(req, res)=>{
        const {date} = req.query;
        try{
            const [records] = await db.query(`SELECT e.employee_id, e.fullname, e.position, e.profile_image, d.department_name, ar.time_in, ar.time_out, ar.status FROM attendance_record ar JOIN employees e ON ar.employee_id = e.employee_id JOIN departments d ON e.department_id = d.department_id WHERE ar.attendance_date = ? ORDER BY e.fullname ASC`, [date]);
            res.json(records);
        }catch(error){
            console.log(error);
            res.status(500).json({message: 'Failed to fetch report', error});
        }
    });

    //total number of employees
    app.get('/dashboard/statistics', async (req, res) =>{
        try{
            const [[employees]] = await db.query('SELECT COUNT(*) AS total FROM employees')
            const [[present]] = await db.query(`SELECT COUNT(*) as total FROM attendance_record WHERE status IN ('Present', 'Late') AND attendance_date = CURDATE()`);
            const [[departments]] = await db.query(`SELECT COUNT(*) as total FROM departments`);

            res.json({totalEmployees: employees.total, totalPresent: present.total, departments: departments.total });
            console.log(employees.total)
        }catch(error){
            console.error(error);
            console.log(error)
            res.status(500).json({message: "Error fetching data"})
        }
    });

    app.get('/dashboard/chart', async(req, res) =>{
        try {
            const [present] = await db.query(`SELECT COUNT(*) AS totalpresent FROM attendance_record WHERE status IN ('Present', 'Late') AND attendance_date = CURDATE()`);
            const [totalEmployees] = await db.query('SELECT COUNT(*) as totalemployees FROM employees')

            res.json({
                totalPresent: present[0].totalpresent, totalEmployees: totalEmployees[0].totalemployees});
        } catch (error) {
            console.error(error)
            res.status(500).json({message: 'Failed to fetch data'})
        }
    })

    app.listen(4000, () => {
        console.log('Server is running on port 4000');
    });

}

startServer();
