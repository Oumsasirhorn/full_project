const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
 
// insert one customer
const createCustomer = async (req, res) => {
    const { customer_id, first_name, last_name, address, email, phone_number } = req.body;
 
    try {
      // สร้างข้อมูลลูกค้าใหม่
      const cust = await prisma.customers.create({
        data: {
          customer_id,
          first_name,
          last_name,
          address,
          email,
          phone_number
        }
      });
 
      // ส่งการตอบกลับเมื่อสร้างลูกค้าสำเร็จ
      res.status(200).json({
        status: "ok",
        message: `User with ID = ${cust.customer_id} is created` // ส่ง ID ที่ถูกสร้างกลับไป
      });
    } catch (err) {
      // จัดการข้อผิดพลาด
      res.status(500).json({
        status: "error",
        message: "Failed to create user",
        error: err.message
      });
    }
  };
//get all customers
const getCustomers = async (req,res) => {
  const custs = await prisma.customers.findMany()//ค้าหาข้อมูลลูกค้าทั้งหมด
  res.json(custs)
}
// delete customers
const deleteCustomer = async(req, res) => {
  const id = req.params.id;
  try{
      //ตรวจสอบว่ามีลูกค้าที่ต้องการลบหรือไม่
     const existingCustomer = await prisma.customers.findUnique({
      where:{
          customer_id: Number(id), //ตรวจสอบว่ามีidลูกค้าที่ต้องการลบหรือไม่
      },
     });
     //ถ้าไม่มีลูกค้าที่ต้องการลบ
     if(!existingCustomer){
      return res.status(404).json({message:'Customer not found'});
     }
     //ลบลูกค้า
     await prisma.customers.delete({
      where:{
          customer_id: Number(id),
      },
     });
     //ส่งการตอบกลับเมื่อลบลูกค้าเสร็จ
     res.status(200).json({
      status: "ok",
      message:`User with id = ${id} is delete ` //ส่ง id ที่ถูกลบไป
     });
  } catch(err){
      console.error('Delete user error:',err); //ส่งข้อความผิดพลาดในการลบลูกค้า
      res.status(500).json({error: err.message}); //ส่งข้อผิดพลาดกลับไป
  }
};
//get customer id
const getCustomer = async (req,res) => {
  const id = req.params.id;
  try{
      const cust =await prisma.customers.findUnique({
          where: {
              customer_id: Number(id),
          },
      });
      if(!cust) {
          return res.status(404).json({'message': 'Customer not found'});
      }else{
          res.status(200).json(cust);
      }
  }catch (err) {
      res.status(500).json(err);
  }
};
// update customer by id
const updateCustomer = async(req,res) =>{
  const {first_name,last_name,address,email,phone_number} = req.body;
  const {id} = req.params; //รับค่า id จากurl
  const data = {};
  if(first_name) data.first_name =first_name;
  if(last_name) data.last_name = last_name;
  if(address) data.address=address;
  if(email) data.email =email;
  if(phone_number) data.phone_number = phone_number;
  if (Object.keys(data).length === 0) {
      return res.status(400).json({
          status:'error',
          message:'No data provided for update.'
      });
  }
  try{
      //อัพเดตข้อมูลลูกค้า
      const cust = await prisma.customers.update({
          data,
          where:{customer_id:Number(id)} //อัปเดตข้อมูลโดยใช้ id
      });
      res.status(200).json({
          status:"ok",
          message: `User with id = ${id} is update `,
          user:cust
      });
  }catch(err){
      if(err.code === 'P2002'){
          //แสดงข้อความเมื่อมีข้อมูลซ้ำ
          res.status(400).json({
              status:'error',
              message:'Email Already exists.'
          });
      }else if(err.code ==='P2025') {
          //แสดงข้อความเมื่อไม่พบข้อมูลที่ต้องการ update
          res.status(500).json({
              status:'error',
              message: `User with id = ${id} not found`
          });
      }else{
          //แสดงข้อความเมื่อเกิดข้อผิดพลาดอื่นๆ
          console.error('Update user error:' ,err);
          res.status(500).json({
              status:'error',
              message:'failed to update u'
          });
      }

  }
}

module.exports = {
  createCustomer, getCustomers,deleteCustomer,getCustomer,updateCustomer
};