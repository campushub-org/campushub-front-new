import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard/Dashboard";

// Student Pages
import StudentLayout from "./pages/dashboard/student/StudentLayout";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import CoursesPage from "./pages/dashboard/student/CoursesPage";
import CourseSchedulePage from "./pages/dashboard/student/CourseSchedulePage";
import ExamSchedulePage from "./pages/dashboard/student/ExamSchedulePage";
import NotificationsPage from "./pages/dashboard/student/NotificationsPage";
import ProfilePage from "./pages/dashboard/student/ProfilePage";
import StudentViewMaterialPage from "./pages/dashboard/student/ViewCourseMaterialPage";

// Teacher Pages
import TeacherLayout from "./pages/dashboard/teacher/TeacherLayout";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import SupportPage from "./pages/dashboard/teacher/SupportPage";
import DepositMaterialPage from "./pages/dashboard/teacher/DepositMaterialPage";
import AvailabilitiesPage from "./pages/dashboard/teacher/AvailabilitiesPage";
import TeacherCourseSchedulePage from "./pages/dashboard/teacher/CourseSchedulePage";
import TeacherExamSchedulePage from "./pages/dashboard/teacher/ExamSchedulePage";
import TeacherNotificationsPage from "./pages/dashboard/teacher/NotificationsPage";
import TeacherProfilePage from "./pages/dashboard/teacher/ProfilePage";
import ViewMaterialPage from "./pages/dashboard/teacher/ViewMaterialPage";

// Dean Pages
import DeanLayout from "./pages/dashboard/dean/DeanLayout";
import DeanDashboard from "./pages/dashboard/DeanDashboard";
import ValidationPage from "./pages/dashboard/dean/ValidationPage";
import DeanCourseSchedulePage from "./pages/dashboard/dean/CourseSchedulePage";
import DeanExamSchedulePage from "./pages/dashboard/dean/ExamSchedulePage";
import DeanNotificationsPage from "./pages/dashboard/dean/NotificationsPage";
import DeanProfilePage from "./pages/dashboard/dean/ProfilePage";
import DeanViewMaterialPage from "./pages/dashboard/dean/ViewMaterialPage";
import TimetableUploadPage from "./pages/dashboard/dean/TimetableUploadPage"; // Import new page

// Admin Pages
import AdminLayout from "./pages/dashboard/admin/AdminLayout";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ActivityPage from "./pages/dashboard/admin/ActivityPage";
import AdminNotificationsPage from "./pages/dashboard/admin/NotificationsPage";
import AdminProfilePage from "./pages/dashboard/admin/ProfilePage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
            
            <Route path="student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="courses/view/:materialId" element={<StudentViewMaterialPage />} />
              <Route path="schedule-courses" element={<CourseSchedulePage />} />
              <Route path="schedule-exams" element={<ExamSchedulePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            <Route path="teacher" element={<TeacherLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="support/view/:materialId" element={<ViewMaterialPage />} />
              <Route path="deposit-material" element={<DepositMaterialPage />} />
              <Route path="availabilities" element={<AvailabilitiesPage />} />
              <Route path="schedule-courses" element={<TeacherCourseSchedulePage />} />
              <Route path="schedule-exams" element={<TeacherExamSchedulePage />} />
              <Route path="notifications" element={<TeacherNotificationsPage />} />
              <Route path="profile" element={<TeacherProfilePage />} />
            </Route>

            <Route path="dean" element={<DeanLayout />}>
              <Route index element={<DeanDashboard />} />
              <Route path="validations" element={<ValidationPage />} />
              <Route path="validations/view/:materialId" element={<DeanViewMaterialPage />} />
              <Route path="timetable-upload" element={<TimetableUploadPage />} /> {/* New route */}
              <Route path="schedule-courses" element={<DeanCourseSchedulePage />} />
              <Route path="schedule-exams" element={<DeanExamSchedulePage />} />
              <Route path="notifications" element={<DeanNotificationsPage />} />
              <Route path="profile" element={<DeanProfilePage />} />
            </Route>

            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
            </Route>
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
