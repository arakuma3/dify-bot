# おみくじアプリ

Flask で動くシンプルなおみくじアプリです。トップページのボタンを押すとサーバー側でランダムに運勢を返し、ページ上に表示します。

## ローカル実行

```bash
pip install -r requirements.txt
FLASK_APP=app.py flask run
```

`http://localhost:5000` にアクセスするとおみくじページが表示されます。
