// ... existing code ... <new file>
export default function SignUpPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Регистрация</h1>
      <div className="rounded-xl border p-6 bg-white max-w-md">
        <div className="space-y-3">
          <label className="block text-sm">Email</label>
          <input type="email" className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#edb419]/50" placeholder="email@example.com" />
          <label className="block text-sm">Пароль</label>
          <input type="password" className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#edb419]/50" placeholder="••••••••" />
          <label className="block text-sm">Повтор пароля</label>
          <input type="password" className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#edb419]/50" placeholder="••••••••" />
          <button className="mt-4 w-full rounded bg-primary text-white py-2">Зарегистрироваться (демо)</button>
          <p className="text-xs text-muted-foreground">Демо-форма без отправки данных. Реальная регистрация не выполняется.</p>
        </div>
      </div>
    </div>
  );
}
// ... existing code ... <end>
