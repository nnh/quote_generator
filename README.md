# Quote generator
## 概要
Quote templateの見積項目を設定するスクリプト  
使用方法はQuote templateスプレッドシート内に記載  
- - -
## 以下、初回のみの対応

メニューの「Repo:nnh/quote_generator」「Branch:master」を選択して「↓」をクリックする。  
※Google Apps Script GitHub アシスタントの追加が必要。  
![スクリプトの追加](https://user-images.githubusercontent.com/24307469/62115229-0ad46700-b2f3-11e9-820b-eec3edb91cc3.png)  
メニューの「リソース」-「ライブラリ」からMomentライブラリを追加する。  
バージョンは最新でOK。  
ライブラリキー：MHMchiX6c1bwSqGM1PZiW_PxhMjh3Sh48  
![Moment](https://user-images.githubusercontent.com/24307469/62115717-d90fd000-b2f3-11e9-9ec0-72c61f28af09.png)  
## Quote Templateのレイアウト変更
### 前作業
- total2シート
    - E~H列を削除する。
    - D列の枠線を再セットする。
- total3シート
    - E~H列を削除する。
- Quotation Requestシート
1行目にQuotation Request（回答）の1行目を貼り付ける。
### 実行PG
work_migration_script.gs  
    - work_setproperty  
    - work_addsheet  
