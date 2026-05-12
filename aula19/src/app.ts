import express, { Request, Response } from "express";
import { Produto } from "./Produto";
import { Fabricante } from "./Fabricante";
import { Endereco } from "./Endereco";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

const produtos: Produto[] = [];

// 1. Cadastrar Produto (POST)
function novoProduto(req: Request, res: Response): void {
    try {
        const data: any = req.body;

        if (!data.id || !data.nome || !data.preco || !data.fabricante) {
            throw new Error("Produto requer id, nome, preco e fabricante");
        }

        //preço > 0
        if (data.preco <= 0) {
            throw new Error("Preco deve ser maior que zero");
        }

        // fabricante deve ter nome
        if (!data.fabricante.nome) {
            throw new Error("Fabricante requer nome");
        }

        //cidade e país obrigatórios
        if (!data.fabricante.endereco || !data.fabricante.endereco.cidade || !data.fabricante.endereco.pais) {
            throw new Error("Endereco requer cidade e pais");
        }

        // ID não pode ser duplicado
        if (produtos.some(p => p.id === data.id)) {
            throw new Error("Ja existe um produto com esse ID");
        }

        const endereco = new Endereco(data.fabricante.endereco.cidade, data.fabricante.endereco.pais);
        const fabricante = new Fabricante(data.fabricante.nome, endereco);
        const produto = new Produto(data.id, data.nome, data.preco, fabricante);

        produtos.push(produto);

        res.status(200).json(produto);
    } catch (e: unknown) {
        res.status(400).json({ Message: (e as Error).message });
    }
}

// 2. Listar Produtos (GET)
function listarProdutos(req: Request, res: Response): void {
    res.status(200).json(produtos);
}

// 3. Buscar Produto por ID (GET)
function buscarProduto(req: Request, res: Response): void {
    const id = parseInt(req.params.id as string);
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        res.status(404).json({ Message: "Produto nao encontrado" });
        return;
    }

    res.status(200).json(produto);
}

// 4. Atualizar Produto (PUT)
function atualizarProduto(req: Request, res: Response): void {
    try {
        const id = parseInt(req.params.id as string);
        const produto = produtos.find(p => p.id === id);

        if (!produto) {
            res.status(404).json({ Message: "Produto nao encontrado" });
            return;
        }

        const data: any = req.body;

        if (!data.nome || !data.preco || !data.fabricante) {
            throw new Error("Produto requer nome, preco e fabricante");
        }

        if (data.preco <= 0) {
            throw new Error("Preco deve ser maior que zero");
        }

        if (!data.fabricante.nome) {
            throw new Error("Fabricante requer nome");
        }

        if (!data.fabricante.endereco || !data.fabricante.endereco.cidade || !data.fabricante.endereco.pais) {
            throw new Error("Endereco requer cidade e pais");
        }

        produto.nome = data.nome;
        produto.preco = data.preco;
        produto.fabricante = new Fabricante(
            data.fabricante.nome,
            new Endereco(data.fabricante.endereco.cidade, data.fabricante.endereco.pais)
        );

        res.status(200).json(produto);
    } catch (e: unknown) {
        res.status(400).json({ Message: (e as Error).message });
    }
}

// 5. Remover Produto (DELETE)
function removerProduto(req: Request, res: Response): void {
    const id = parseInt(req.params.id as string);
    const indice = produtos.findIndex(p => p.id === id);

    if (indice === -1) {
        res.status(404).json({ Message: "Produto nao encontrado" });
        return;
    }

    const removido = produtos.splice(indice, 1);
    res.status(200).json(removido);
}

app.get("/api/produto", listarProdutos);
app.get("/api/produto/:id", buscarProduto);
app.post("/api/produto", novoProduto);
app.put("/api/produto/:id", atualizarProduto);
app.delete("/api/produto/:id", removerProduto);

app.listen(PORT, () => console.log(`API rodando na URL: http://localhost:${PORT}`));
