# Infinite Flight Fleet Import Script

このスクリプトは、Infinite Flight Communityの機種とリバリーリストをデータベースにインポートします。

## 使用方法

```bash
npm run import-fleet
```

## データソース

データは以下のInfinite Flight Communityのページから取得しています：
https://community.infiniteflight.com/t/every-aircraft-and-livery-in-if/777362

## 注意事項

- 既存の機種とリバリーは保持されます（重複チェックあり）
- 機種名は完全な形式で保存されます（例: "Airbus A330-900neo (PRO)"）
- スクリプトを実行すると、新しい機種とリバリーのみが追加されます

## 機種の追加

`scripts/import-infinite-flight-fleet.js` の `fleetData` オブジェクトに新しい機種とリバリーを追加できます。

例：
```javascript
const fleetData = {
  'Airbus A330-900neo (PRO)': [
    'Air Belgium',
    'Air Mauritius',
    // ... リバリーリスト
  ],
  // 新しい機種を追加
  'Boeing 777-300ER (PRO)': [
    'Air Canada',
    'Air France',
    // ... リバリーリスト
  ]
}
```

## データベース構造

- **AircraftType**: 機種情報（例: "Airbus A330-900neo (PRO)"）
- **Livery**: リバリー情報（機種に紐づく）




