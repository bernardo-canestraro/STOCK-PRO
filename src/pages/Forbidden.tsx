export default function Forbidden() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold text-red-500">403 - Acesso Negado</h1>
      <p className="text-gray-400 mt-4">
        Você não tem permissão para acessar esta página.
      </p>
    </div>
  );
}
