import React, { Suspense, lazy } from "react";
import Spinner from "./components/common/Spinner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { TimerProvider } from "./context/TimerContext";
import { JournalProvider } from "./context/JournalContext";
import { TimetableProvider } from "./context/TimetableContext";
import { QuoteProvider } from "./context/QuoteContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import NavBar from "./components/common/NavBar";
import { SettingsProvider } from "./context/SettingsContext";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
const TasksPage = lazy(() => import("./pages/TasksPage"));
const TimerPage = lazy(() => import("./pages/TimerPage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const TimetablePage = lazy(() => import("./pages/TimetablePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage"));

function App() {
  return (
    <AuthProvider>
      <QuoteProvider>
        <TaskProvider>
          <TimerProvider>
            <JournalProvider>
              <TimetableProvider>
                <SettingsProvider>
                  <BrowserRouter>
                    <NavBar />
                    <div className="app-content">
                      <Suspense
                        fallback={
                          <div
                            style={{
                              padding: 24,
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <Spinner size="lg" />
                          </div>
                        }
                      >
                        <Routes>
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route element={<ProtectedRoute />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/tasks" element={<TasksPage />} />
                            <Route path="/timer" element={<TimerPage />} />
                            <Route path="/journal" element={<JournalPage />} />
                            <Route
                              path="/timetable"
                              element={<TimetablePage />}
                            />
                            <Route
                              path="/bookmarks"
                              element={<BookmarksPage />}
                            />
                            <Route path="/profile" element={<ProfilePage />} />
                          </Route>
                        </Routes>
                      </Suspense>
                    </div>
                  </BrowserRouter>
                </SettingsProvider>
              </TimetableProvider>
            </JournalProvider>
          </TimerProvider>
        </TaskProvider>
      </QuoteProvider>
    </AuthProvider>
  );
}

export default App;
