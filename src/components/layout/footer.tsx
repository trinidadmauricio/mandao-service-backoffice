export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex h-14 items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mandao Service. Todos los derechos reservados.
        </p>
        <p className="text-sm text-muted-foreground">Versión 1.0.0</p>
      </div>
    </footer>
  );
}

