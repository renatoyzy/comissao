import "@/styles/globals.css";

export const metadata = {
  title: "Comissão do Delcides",
  description: "App de anotação de fiados",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
