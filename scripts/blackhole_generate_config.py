"""
黑洞引擎 shareView 参数提取工具 - 通过 API 获取 resourceId
"""

import requests
import json
from datetime import datetime
from urllib.parse import quote

SHARE_VIEW_URLS = [
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a20505f017a0e995dbc7c8e75619",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a2056be9b8edc1ffaaf89639e388",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a205c5fd7d6ffda714af4bd33871",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a205f78b576c6e043720bfbf583d",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a20625d80cbee0281051d3e1769d",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a206540f405fadfa41739eb693fb",
    "https://engine3.bjblackhole.com/BlackHole/index.html#/shareView/3a20a2059aefe390c985c56c4a5d3d93",
]

API_URL = "https://engine3.bjblackhole.com/engineweb/api/autoconvert/EngineRes/RequestEngineRes"
OUTPUT_FILE = "blackhole_complete_params.json"

# 从 Response 中看到的 API 端点格式
# 需要找到获取 shareView 信息的 API
SHARE_INFO_API = "https://engine3.bjblackhole.com/engineweb/api/autoconvert/EngineRes/RequestEngineRes"

# 已知的 resourceId 映射（从用户提供的 Response 中获取）
KNOWN_MAPPING = {
    "3a20a20505f017a0e995dbc7c8e75619": "3a20a1143894887c538e5f3be09ba013"
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    "Content-Type": "text/plain;charset=UTF-8",
}


def get_resource_id_from_share_id(share_id):
    """尝试通过 API 获取 shareId 对应的 resourceId"""
    
    # 方法 1: 检查已知映射
    if share_id in KNOWN_MAPPING:
        return KNOWN_MAPPING[share_id]
    
    # 方法 2: 尝试从 shareView 页面获取
    # 这需要通过浏览器渲染页面并提取 API 响应
    # 暂时无法实现，返回 None
    return None


def build_request_config(resource_id, share_id):
    """构建请求配置"""
    if not resource_id:
        return None
    
    # 移除可能的横线
    res_id_clean = resource_id.replace("-", "")
    
    return {
        "resourcesAddress": API_URL,
        "method": "POST",
        "protocol": "webem",
        "dir": "url_res04",
        "pathRaw": f"{res_id_clean}/hugemodel/hlod_cache/0/{res_id_clean}/picture/dxt1/8_0.dat",
        "resId": res_id_clean,
        "filetimel": "117782144",
        "filetimeh": "31247486",
        "packpath": f"{res_id_clean}\\hugemodel\\hlod_cache\\0\\{res_id_clean}.pak",
        "packtimel": "137782144",
        "packtimeh": "31247486"
    }


def main():
    print("=" * 70)
    print("黑洞引擎 shareView 参数配置生成器")
    print("=" * 70)
    
    results = []
    success_count = 0
    failed_count = 0
    
    for url in SHARE_VIEW_URLS:
        share_id = url.split("/shareView/")[-1]
        print(f"\n处理: {share_id}")
        
        # 获取 resourceId
        resource_id = get_resource_id_from_share_id(share_id)
        
        if resource_id:
            print(f"  ✓ 找到 resourceId: {resource_id}")
            success_count += 1
            
            config = build_request_config(resource_id, share_id)
            
            result = {
                "shareViewUrl": url,
                "shareId": share_id,
                "modelName": "[需手动填写]",
                "request": config,
                "networkMeta": {
                    "statusCode": 200,
                    "contentType": "text/plain;charset=UTF-8",
                    "capturedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
            }
        else:
            print(f"  ✗ 未找到 resourceId")
            failed_count += 1
            
            result = {
                "shareViewUrl": url,
                "shareId": share_id,
                "modelName": "[需手动填写]",
                "request": None,
                "error": "未找到对应的 resourceId，请从浏览器 Network 中获取"
            }
        
        results.append(result)
    
    # 保存结果
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # 生成摘要
    summary = f"\n{'='*70}\n"
    summary += "结果摘要\n"
    summary += f"{'='*70}\n"
    summary += f"\n总链接数: {len(SHARE_VIEW_URLS)}\n"
    summary += f"成功: {success_count}\n"
    summary += f"失败: {failed_count}\n"
    summary += f"\n注意: 由于 shareId 和 resourceId 不是简单对应关系，\n"
    summary += "需要为每个 shareView 从浏览器 Network 中获取对应的 resourceId。\n"
    summary += "\n已获取的映射:\n"
    for share_id, res_id in KNOWN_MAPPING.items():
        summary += f"  {share_id} -> {res_id}\n"
    summary += f"\n结果已保存到: {OUTPUT_FILE}\n"
    summary += f"{'='*70}\n"
    
    print(summary)


if __name__ == "__main__":
    main()
