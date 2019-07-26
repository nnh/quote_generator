# Quote generator
## 概要
Quote templateの見積項目を設定するスクリプト  
使用方法はQuote templateスプレッドシート内に記載  
- - -
## 以下、初回のみの対応
Momentライブラリの追加が必要  
ライブラリキー：MHMchiX6c1bwSqGM1PZiW_PxhMjh3Sh48  
## Quote Templateのレイアウト変更
### 前作業
- total2シート
    - E~H列を削除する。
    - D列の枠線を再セットする。
- total3シート
    - E~H列を削除する。
- Quotation Requestシート
シートの内容を全て削除し、Quotation Request（回答）の1行目を貼り付ける。
### 実行PG
work_migration_script.gs  
    - work_setproperty  
    - work_addsheet  
