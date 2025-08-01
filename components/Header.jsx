import Link from "next/link";

export default function Header() {
    return <>
        <header>
            <h1>Sistema de vendas da comissão de formatura</h1>
            <nav>
                <Link href="." className="SeletorDeAba">Venda</Link>
                <Link href="estoque" className="SeletorDeAba">Estoque</Link>
                <Link href="dividas" className="SeletorDeAba">Dívidas</Link>
            </nav>
        </header>
    </>
}