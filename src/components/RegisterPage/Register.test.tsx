import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './Register';
import fetchGraphQL from '@/utils/graphqlClient';
import { useRouter } from 'next/navigation';

jest.mock('../../utils/graphqlClient'); // Mock fetchGraphQL เพื่อไม่ให้มีการเรียก API จริง
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(), // Mock useRouter เพื่อทดสอบการ Redirect
}));

describe('Register Component', () => {
  const pushMock = jest.fn(); // Mock ฟังก์ชัน push เพื่อจำลองการ redirect

  // ตั้งค่าเริ่มต้นก่อนการทดสอบแต่ละครั้ง
  beforeEach(() => {
    jest.clearAllMocks(); // ล้าง mock ทุกครั้งก่อนเริ่มการทดสอบ
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock }); // จำลองการใช้งาน useRouter
  });

  // การทดสอบการแสดงผลของฟอร์มลงทะเบียน
  it('renders the register form', () => {
    render(<Register />); // render คอมโพเนนต์ Register

    // ตรวจสอบว่า input field ทั้งหมดถูกแสดงผลอย่างถูกต้อง
    expect(screen.getByPlaceholderText(/First Name/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Last Name/i)).not.toBeNull();
    expect(screen.getByPlaceholderText(/Email/i)).not.toBeNull();
    
    const [passwordField, confirmPasswordField] = screen.getAllByPlaceholderText(/Password/i);
    expect(passwordField).not.toBeNull();
    expect(confirmPasswordField).not.toBeNull();

    // ตรวจสอบว่าลิงก์ไปหน้า Login มีอยู่ในหน้า
    expect(screen.getByText(/Already have an account?/i)).not.toBeNull();
  });

  // การทดสอบการลงทะเบียนผู้ใช้สำเร็จและการ redirect
  it('successfully registers a user and redirects', async () => {
    // Mock fetchGraphQL เพื่อให้มั่นใจว่าจะส่งข้อมูลไปตามที่เรากำหนด
    (fetchGraphQL as jest.Mock).mockResolvedValueOnce({});
    
    // จำลองฟังก์ชัน confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true); // ให้ตอบตกลงใน dialog เสมอ

    render(<Register />); // render คอมโพเนนต์ Register

    // เปลี่ยนค่าใน input field โดยการจำลอง event change
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'john.doe@example.com' } });
    
    const [passwordField, confirmPasswordField] = screen.getAllByPlaceholderText(/Password/i);
    fireEvent.change(passwordField, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });

    // คลิกปุ่มเพื่อส่งฟอร์ม
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    // รอจนกว่า fetchGraphQL จะถูกเรียก
    await waitFor(() => {
      expect(fetchGraphQL).toHaveBeenCalledTimes(1); // ตรวจสอบว่า fetchGraphQL ถูกเรียก 1 ครั้ง
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: expect.any(String),
        })
      );
    });

    // ตรวจสอบว่า dialog confirm ปรากฏขึ้น
    expect(window.confirm).toHaveBeenCalledWith("Registration successful! Would you like to go to the login page?");
    
    // ตรวจสอบว่าเกิดการ redirect ไปยังหน้า /login
    expect(pushMock).toHaveBeenCalledWith('/login');

    // คืนค่าเดิมให้กับ window.confirm หลังจากทดสอบเสร็จสิ้น
    window.confirm = originalConfirm;
  });
});
