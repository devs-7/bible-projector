package helper;

import exceptions.QueryBibleException;
import model.BibleText;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;

public class Bible {
    public static BibleText query(String q) throws QueryBibleException, SQLException {
        try {
            q = q.replace(":", " ");
            q = q.replace("  ", " ");

            q = StringHelper.normalizar(q);
            ArrayList<String> livCapVer = new ArrayList<>(Arrays.asList(q.split(" ")));

            String ver = livCapVer.get(livCapVer.size() - 1);
            livCapVer.remove(livCapVer.size() - 1);
            String cap = livCapVer.get(livCapVer.size() - 1);
            livCapVer.remove(livCapVer.size() - 1);
            String liv = String.join(" ", livCapVer);

            ResultSet resultSet = DbController.query(addJoin(
                    "livros._sigla like '%" + liv + "%' AND textos.capitulo = " + cap + " AND textos.versiculo = " + ver + ""
            ));

            if (!resultSet.next()) {
                resultSet = DbController.query(addJoin(
                        "livros._nome like '%" + liv + "%' AND textos.capitulo = " + cap + " AND textos.versiculo = " + ver + ""
                ));
            }

            BibleText bibleText = new BibleText();
            bibleText.setLivro(resultSet.getString("livro"));
            bibleText.setCapitulo(resultSet.getInt("capitulo"));
            bibleText.setVersiculo(resultSet.getInt("versiculo"));
            bibleText.setTexto(resultSet.getString("texto"));
            return bibleText;
        } catch (SQLException e) {
            throw new SQLException(e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new QueryBibleException("Pesquisa inválida");
        }
    }


    private static String addJoin(String s) {
        return "SELECT livros.nome as livro, textos.capitulo, textos.versiculo, textos.texto \n" +
                "FROM textos\n" +
                "JOIN livros on textos.id_livro = livros.id\n" +
                "WHERE " + s;
    }
}