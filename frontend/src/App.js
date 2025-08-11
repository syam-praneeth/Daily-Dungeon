import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { TimerProvider } from "./context/TimerContext";
import { JournalProvider } from "./context/JournalContext";
import { TimetableProvider } from "./context/TimetableContext";
import { QuoteProvider } from "./context/QuoteContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import NavBar from "./components/common/NavBar";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
const TasksPage = lazy(() => import("./pages/TasksPage"));
const TimerPage = lazy(() => import("./pages/TimerPage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const TimetablePage = lazy(() => import("./pages/TimetablePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

function App() {
  return (
    <AuthProvider>
      <QuoteProvider>
        <TaskProvider>
          <TimerProvider>
            <JournalProvider>
              <TimetableProvider>
                <BrowserRouter>
                  <NavBar />
                  <Suspense
                    fallback={<div style={{ padding: 20 }}>Loading...</div>}
                  >
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/tasks" element={<TasksPage />} />
                        <Route path="/timer" element={<TimerPage />} />
                        <Route path="/journal" element={<JournalPage />} />
                        <Route path="/timetable" element={<TimetablePage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </TimetableProvider>
            </JournalProvider>
          </TimerProvider>
        </TaskProvider>
      </QuoteProvider>
    </AuthProvider>
  );
}

export default App;
