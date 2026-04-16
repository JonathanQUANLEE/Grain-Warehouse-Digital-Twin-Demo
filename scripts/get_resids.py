"""
获取 shareView 对应的 resId
通过解析 shareView 页面的 JavaScript 变量来获取 resId
"""

import requests
import re
import json
from datetime import datetime

SHARE_VIEW_URLS = [
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a20505f017a0e995dbc7c8e75619",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a2056be9b8edc1ffaaf89639e388",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a205c5fd7d6ffda714af4bd33871",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a205f78b576c6e043720bfbf583d",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a20625d80cbee0281051d3e1769d",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a206540f405fadfa41739eb693fb",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a2059aefe390c985c56c4a5d3d93",
]

def get_share_view_info(url):
    """获取 shareView 的信息"""
    share_id = url.split("/shareView/")[-1]
    print(f"\n获取: {share_id}")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        html = response.text
        
        # 尝试从 HTML/JS 中提取 resId 或 dataSetId
        # 常见的模式：
        patterns = [
            r'resId["\s]*[:=]["\s]*([a-f0-9]{32})',
            r'dataSetId["\s]*[:=]["\s]*([a-f0-9]{32})',
            r'res[_-]?id["\s]*[:=]["\s]*([a-f0-9]{32})',
            r'"resId"\s*:\s*"([a-f0-9]{32})"',
            r'"dataSetId"\s*:\s*"([a-f0-9]{32})"',
        ]
        
        found_ids = []
        for pattern in patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            found_ids.extend(matches)
        
        # 查找所有 32 位 hex 字符串
        all_hex = re.findall(r'[a-f0-9]{32}', html, re.IGNORECASE)
        
        # 查找 title
        title_match = re.search(r'<title>(.*?)</title>', html)
        title = title_match.group(1) if title_match else "未知"
        
        return {
            "shareId": share_id,
            "title": title,
            "possibleResIds": list(set(found_ids)),
            "allHexIds": list(set(all_hex))[:10],  # 最多取 10 个
            "htmlLength": len(html)
        }
    except Exception as e:
        return {
            "shareId": share_id,
            "error": str(e)
        }


def main():
    print("=" * 70)
    print("获取 shareView 对应的 resId")
    print("=" * 70)
    
    results = []
    
    for url in SHARE_VIEW_URLS:
        info = get_share_view_info(url)
        results.append(info)
        
        print(f"  标题: {info.get('title', 'N/A')}")
        if info.get('possibleResIds'):
            print(f"  找到的 resId: {info['possibleResIds']}")
        if info.get('allHexIds'):
            print(f"  页面中的其他 32 位 hex ID (前 10 个): {info['allHexIds']}")
    
    # 保存结果
    with open("shareview_resids.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n结果已保存到: shareview_resids.json")


if __name__ == "__main__":
    main()
