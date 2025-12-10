
import type { Metadata } from 'next';
import { Inter, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/context/UserContext';
import { InstitutionProvider } from '@/context/InstitutionContext';
import { AcademicProvider } from '@/context/AcademicContext';
import { TeacherProvider } from '@/context/TeacherContext';
import { FixedScheduleProvider } from '@/context/FixedScheduleContext';
import { CircularProvider } from '@/context/CircularContext';
import { TemplateProvider } from '@/context/TemplateContext';
import { CalendarProvider } from '@/context/CalendarContext';
import { DashboardProvider } from '@/context/DashboardContext';
import { TaskProvider } from '@/context/TaskContext';
import { AttendanceProvider } from '@/context/AttendanceContext';
import { AccessLogProvider } from '@/context/AccessLogContext';
import { WebpageProvider } from '@/context/WebpageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AIChatAssistant } from '@/components/ai-chat-assistant';
import { ConductProvider } from '@/context/ConductContext';
import { MessagingProvider } from '@/context/MessagingContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-code-pro',
});

export const metadata: Metadata = {
  title: 'SKOOL KITS AI',
  description: 'Plataforma de gestión educativa impulsada por IA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${sourceCodePro.variable} font-body antialiased`}>
        <ThemeProvider>
            <InstitutionProvider>
              <TeacherProvider>
                <UserProvider>
                  <AcademicProvider>
                    <FixedScheduleProvider>
                      <CircularProvider>
                        <TemplateProvider>
                          <CalendarProvider>
                            <DashboardProvider>
                              <TaskProvider>
                                <AttendanceProvider>
                                  <MessagingProvider>
                                    <AccessLogProvider>
                                      <ConductProvider>
                                        <WebpageProvider>
                                          {children}
                                          <AIChatAssistant />
                                        </WebpageProvider>
                                      </ConductProvider>
                                    </AccessLogProvider>
                                  </MessagingProvider>
                                </AttendanceProvider>
                              </TaskProvider>
                            </DashboardProvider>
                          </CalendarProvider>
                        </TemplateProvider>
                      </CircularProvider>
                    </FixedScheduleProvider>
                  </AcademicProvider>
                </UserProvider>
              </TeacherProvider>
            </InstitutionProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
