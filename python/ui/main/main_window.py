from model.bible import Bible, format_reference
from ui.projetor.projetor_window import ProjetorWindow

from ui.main.window import *
from PyQt5.QtWidgets import QMainWindow, QDesktopWidget
from PyQt5.QtGui import QKeyEvent
from PyQt5 import QtCore


class MainWindow(QMainWindow, Ui_MainWindow):
    def __init__(self, parent=None):
        super().__init__(parent)
        super().setupUi(self)

        self.bible = Bible()
        self.bible.listener = self.bible_listener
        self.projetor_window = ProjetorWindow()

        self.pesquisarButton.clicked.connect(self.pesquisar)
        self.projetarButton.clicked.connect(self.projetar)
        self.pesquisaLineEdit.returnPressed.connect(self.pesquisar)

    def keyPressEvent(self, event: QKeyEvent):
        key = event.key()
        if key == QtCore.Qt.Key_F4:
            self.pesquisaLineEdit.setFocus(True)
            self.pesquisaLineEdit.selectAll()
        elif key == QtCore.Qt.Key_F5:
            self.projetar()
        elif key == QtCore.Qt.Key_Escape:
            self.fechar_projetor()
        elif key == QtCore.Qt.Key_F6:
            self.atualizar_texto_projetor()
        elif key == QtCore.Qt.Key_PageUp:
            self.bible.next()
        elif key == QtCore.Qt.Key_PageDown:
            self.bible.back()

    def set_ref(self, ref: dict):
        texto_referencia = f"{ref['text']} ({format_reference(ref)})"
        self.mainTextEdit.setText(texto_referencia)
        self.projetor_window.textLabel.setText(texto_referencia)

    def bible_listener(self, ref):
        self.set_ref(ref)

    def atualizar_texto_projetor(self):
        self.projetor_window.text = self.mainTextEdit.toPlainText()

    def fechar_projetor(self):
        self.projetor_window.close()

    def projetar(self):
        monitor = QDesktopWidget().screenGeometry(2)
        self.projetor_window.move(monitor.left(), monitor.top())
        self.projetor_window.showFullScreen()

    def pesquisar(self):
        pesquisa = self.pesquisaLineEdit.text()
        if pesquisa != '':
            self.bible.query(pesquisa)