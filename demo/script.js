const modelFiles = [
  "[revit]0-场布_土建模型.pak",
  "[revit]01-浅圆仓_土建模型_ref[649111].pak",
  "[revit]02-提升塔_土建模型_ref[649114].pak",
  "[revit]03-散装平方仓_土建模型_ref[649117].pak",
  "[revit]04-消防泵房及发电机房_土建模型_ref[649120].pak",
  "[revit]05-检化验室_土建模型_ref[649123].pak",
  "[revit]06-消防水池_土建模型_ref[649126].pak"
];

const paths = {
  temperature: "../data/cj_temp/cj_temperature.csv",
  air: "../data/cj_temp/sg_ck_air.csv",
  pest: "../data/cj_temp/sg_ck_pest.csv",
  steam: "../data/cj_temp/sg_ck_steam.csv"
};

const bootConfig = window.__BH_ENGINE_BOOT__ || {};

const engine = {
  sdkDir: bootConfig.sdkDir || "../sdk",
  sdkSource: bootConfig.sdkSource || "local",
  commonUrl: bootConfig.commonUrl || "",
  localDataSetPath: bootConfig.localDataSetPath || "../models",
  platformDataSetConfigUrl: bootConfig.platformDataSetConfigUrl || "../config/blackhole_complete_params.sample.json",
  fallbackDataSet: bootConfig.fallbackDataSet || {
    dataSetId: "res_qxsy",
    resourcesAddress: "https://demo.bjblackhole.com/default.aspx?dir=url_res03&path=res_qxsy",
    useTransInfo: false
  },
  preferOfficialDataSet: bootConfig.preferOfficialDataSet !== false,
  requestedDataSource: bootConfig.requestedDataSource || "platform",
  activeDataSetId: "",
  activeDataSetSource: "official",
  initialized: false,
  loaded: false,
  usingLocal: false,
  autoCamStep: 0,
  loadMode: "idle",
  pendingDataSetConfigs: [],
  loadedDataSetConfigs: [],
  failedDataSetConfigs: [],
  currentDataSetConfig: null,
  currentDataSetIndex: 0,
  platformTotalDataSetCount: 0,
  loadTimeoutId: null,
  dataSetTimeoutMs: 15000,
  cameraLocated: false
};

const state = {
  warehouses: [],
  alerts: [],
  aiEvents: [],
  projectCandidates: [],
  dataStats: {
    temperatureRows: 0,
    airRows: 0,
    pestRows: 0,
    steamRows: 0,
    airActiveWarehouses: 0,
    pestRiskWarehouses: 0,
    steamTaskWarehouses: 0
  },
  cutaway: false,
  autoRoamTimer: null,
  aiTimer: null,
  aiApiTimer: null,
  streamPlayer: null,
  currentIndex: 0,
  roamMode: "静态视角",
  weather: "sunny",
  toastTimer: null,
  overlaysVisible: true,
  apiDraft: {
    baseUrl: "https://engine3.bjblackhole.com",
    authMode: "token",
    token: "",
    clientId: "",
    secretKey: "",
    userId: "",
    tokenBody: "{\"userName\":\"admin\",\"password\":\"123456\"}",
    streamUrl: "",
    topDemoApi: "https://developer.bjblackhole.com/api/developercenter/Demo/list/topdemos",
    subsystemApi: "",
    subsystemType: "inout",
    ledgerApi: "",
    aiApi: "",
    aiPollMs: "6000"
  }
};

const el = {
  modelList: document.getElementById("modelList"),
  warehouseMap: document.getElementById("warehouseMap"),
  detail: document.getElementById("warehouseDetail"),
  dName: document.getElementById("dName"),
  dTemp: document.getElementById("dTemp"),
  dHum: document.getElementById("dHum"),
  dGas: document.getElementById("dGas"),
  dHeight: document.getElementById("dHeight"),
  dFan: document.getElementById("dFan"),
  dAir: document.getElementById("dAir"),
  kpiStock: document.getElementById("kpiStock"),
  kpiOnline: document.getElementById("kpiOnline"),
  kpiAlerts: document.getElementById("kpiAlerts"),
  kpiTodayOps: document.getElementById("kpiTodayOps"),
  kpiWeather: document.getElementById("kpiWeather"),
  weatherSelect: document.getElementById("weatherSelect"),
  quickLocateSelect: document.getElementById("quickLocateSelect"),
  firstPersonBtn: document.getElementById("firstPersonBtn"),
  autoRoamBtn: document.getElementById("autoRoamBtn"),
  cutawayBtn: document.getElementById("cutawayBtn"),
  weatherOverlay: document.getElementById("weatherOverlay"),
  sceneAlertToast: document.getElementById("sceneAlertToast"),
  roamStatus: document.getElementById("roamStatus"),
  tempChart: document.getElementById("tempChart"),
  deviceChart: document.getElementById("deviceChart"),
  alertList: document.getElementById("alertList"),
  subsystemList: document.getElementById("subsystemList"),
  subsystemApiInput: document.getElementById("subsystemApiInput"),
  subsystemTypeSelect: document.getElementById("subsystemTypeSelect"),
  subsystemApiPreview: document.getElementById("subsystemApiPreview"),
  requestSubsystemBtn: document.getElementById("requestSubsystemBtn"),
  ledgerApiInput: document.getElementById("ledgerApiInput"),
  loadLedgerBtn: document.getElementById("loadLedgerBtn"),
  ledgerPanel: document.getElementById("ledgerPanel"),
  simulateAiBtn: document.getElementById("simulateAiBtn"),
  clearAiBtn: document.getElementById("clearAiBtn"),
  aiApiInput: document.getElementById("aiApiInput"),
  startAiApiBtn: document.getElementById("startAiApiBtn"),
  stopAiApiBtn: document.getElementById("stopAiApiBtn"),
  aiEventList: document.getElementById("aiEventList"),
  streamUrlInput: document.getElementById("streamUrlInput"),
  startStreamBtn: document.getElementById("startStreamBtn"),
  stopStreamBtn: document.getElementById("stopStreamBtn"),
  videoFusion: document.getElementById("videoFusion"),
  scene: document.getElementById("scene"),
  engineStatus: document.getElementById("engineStatus"),
  canvas: document.getElementById("bhCanvas"),
  apiBaseUrl: document.getElementById("apiBaseUrl"),
  authMode: document.getElementById("authMode"),
  apiToken: document.getElementById("apiToken"),
  apiClientId: document.getElementById("apiClientId"),
  apiSecretKey: document.getElementById("apiSecretKey"),
  apiUserId: document.getElementById("apiUserId"),
  buildHeaderBtn: document.getElementById("buildHeaderBtn"),
  requestProjectBtn: document.getElementById("requestProjectBtn"),
  requestTopDemoBtn: document.getElementById("requestTopDemoBtn"),
  projectSelect: document.getElementById("projectSelect"),
  loadProjectSceneBtn: document.getElementById("loadProjectSceneBtn"),
  requestTokenBtn: document.getElementById("requestTokenBtn"),
  tokenBodyInput: document.getElementById("tokenBodyInput"),
  headerPreview: document.getElementById("headerPreview"),
  curlPreview: document.getElementById("curlPreview"),
  apiResponsePreview: document.getElementById("apiResponsePreview"),
  menuTree: document.getElementById("menuTree"),
  hudTabs: [...document.querySelectorAll(".hud-tab")],
  pageSubtitle: document.getElementById("pageSubtitle"),
  toolbarPanel: document.getElementById("toolbarPanel"),
  kpiPanel: document.getElementById("kpiPanel"),
  hudLeft: document.getElementById("hudLeft"),
  hudRight: document.getElementById("hudRight"),
  hudBottom: document.getElementById("hudBottom"),
  scenePanel: document.getElementById("scenePanel"),
  dashboardPanel: document.getElementById("dashboardPanel"),
  expandedOverlay: document.getElementById("expandedOverlay"),
  closeExpandedBtn: document.getElementById("closeExpandedBtn"),
  expandedTitle: document.getElementById("expandedTitle"),
  hudClock: document.getElementById("hudClock")
};

const menuMemoryKey = "grain_demo_menu_selection_v1";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\"") {
      if (inQuotes && text[i + 1] === "\"") {
        current += "\"";
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") {
        i++;
      }
      if (current.length || row.length) {
        row.push(current);
        rows.push(row);
        row = [];
        current = "";
      }
      continue;
    }
    current += ch;
  }
  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }
  return rows;
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function safeText(v) {
  return (v || "").replace(/\s+/g, "");
}

function hashNumber(value) {
  const text = String(value || "");
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function parsePestScore(raw) {
  if (!raw) {
    return 0;
  }
  let score = 0;
  const groups = String(raw).split("|");
  for (const group of groups) {
    const nums = group.split(",").map(item => num(item, 0));
    score += nums.reduce((s, value) => s + value, 0);
  }
  return score;
}

function buildSourceMaps(temperatureRows, airRows, pestRows, steamRows) {
  const airById = new Map();
  const airByName = new Map();
  for (const r of airRows) {
    const warehouseId = safeText(r[3]);
    const warehouseName = safeText(r[4]);
    if (!warehouseId && !warehouseName) {
      continue;
    }
    const airRecord = {
      fan: num(r[34], 0),
      airConditioner: num(r[35], 0),
      mode: num(r[6], 0),
      date: r[2] || ""
    };
    if (warehouseId) {
      airById.set(warehouseId, airRecord);
    }
    if (warehouseName) {
      airByName.set(warehouseName, airRecord);
    }
  }

  const pestById = new Map();
  const pestByName = new Map();
  for (const r of pestRows) {
    const warehouseId = safeText(r[3]);
    const warehouseName = safeText(r[4]);
    if (!warehouseId && !warehouseName) {
      continue;
    }
    const score = parsePestScore(r[9]);
    if (warehouseId) {
      pestById.set(warehouseId, score);
    }
    if (warehouseName) {
      pestByName.set(warehouseName, score);
    }
  }

  const steamById = new Set();
  const steamByName = new Set();
  for (const r of steamRows) {
    const warehouseId = safeText(r[24]);
    const warehouseName = safeText(r[25]);
    if (warehouseId) {
      steamById.add(warehouseId);
    }
    if (warehouseName) {
      steamByName.add(warehouseName);
    }
  }

  const airActiveWarehouses = [...airById.values()].filter(item => item.fan > 0.8 || item.airConditioner > 0.8 || item.mode >= 2).length;
  return {
    airById,
    airByName,
    pestById,
    pestByName,
    steamById,
    steamByName,
    stats: {
      temperatureRows: temperatureRows.length,
      airRows: airRows.length,
      pestRows: pestRows.length,
      steamRows: steamRows.length,
      airActiveWarehouses,
      pestRiskWarehouses: pestById.size,
      steamTaskWarehouses: steamById.size
    }
  };
}

async function fetchText(path) {
  const resp = await fetch(path);
  if (!resp.ok) {
    throw new Error(path);
  }
  return await resp.text();
}

function warehouseState(w) {
  const risk = (w.temperature > 28 ? 2 : w.temperature > 24 ? 1 : 0) + (w.humidity > 70 ? 1 : 0) + (w.gas > 12 ? 1 : 0);
  if (risk >= 3 || w.deviceStatus === "故障") return "danger";
  if (risk >= 1) return "warn";
  return "ok";
}

function mapDeviceStatus(raw) {
  if (raw === "i") return "运行";
  if (raw === "n") return "停机";
  return "运行";
}

function buildModelList() {
  el.modelList.innerHTML = modelFiles.map((m, i) => `<div class="model-item">${i + 1}. ${m}</div>`).join("");
}

function showSceneAlert(text) {
  el.sceneAlertToast.textContent = text;
  el.sceneAlertToast.classList.add("active");
  if (state.toastTimer) {
    clearTimeout(state.toastTimer);
  }
  state.toastTimer = setTimeout(() => {
    el.sceneAlertToast.classList.remove("active");
  }, 2200);
}

function setEngineStatus(text) {
  el.engineStatus.textContent = `引擎状态：${text}`;
}

function getSdkSummary() {
  return engine.sdkSource === "remote" ? "SDK远程" : "SDK本地";
}

function getDataSetSummary() {
  if (engine.activeDataSetSource === "platform") {
    return "模型平台";
  }
  if (engine.activeDataSetSource === "local") {
    return "模型本地";
  }
  return "模型官方";
}

function getDataSetLabel(config, index = 0) {
  if (!config) {
    return `模型_${index + 1}`;
  }
  return config.name || config.dataSetId || config.resId || `模型_${index + 1}`;
}

function clearDataSetLoadTimer() {
  if (engine.loadTimeoutId) {
    clearTimeout(engine.loadTimeoutId);
    engine.loadTimeoutId = null;
  }
}

function startDataSetLoadTimer() {
  clearDataSetLoadTimer();
  engine.loadTimeoutId = setTimeout(() => {
    if (engine.loadMode === "platform-recover") {
      console.warn("[BlackHole] 恢复已成功模型超时");
      engine.loadedDataSetConfigs = [];
      engine.loadMode = "platform-seq";
      clearDataSetLoadTimer();
      setTimeout(loadNextPlatformDataSet, 250);
      return;
    }
    if (engine.loadMode === "platform-seq" && engine.currentDataSetConfig) {
      handlePlatformDataSetFailure(`加载超时（>${Math.round(engine.dataSetTimeoutMs / 1000)}s）`);
    }
  }, engine.dataSetTimeoutMs);
}

function applyEngineRuntimeSettings() {
  window.BlackHole3D.Common.setMaxResMemMB(3000);
  window.BlackHole3D.Common.setExpectMaxInstMemMB(2200);
  window.BlackHole3D.Common.setExpectMaxInstDrawFaceNum(12000000);
  window.BlackHole3D.Common.setPageLoadLev(1);
  try {
    window.BlackHole3D.Graphics.setSysUIPanelVisible(false);
    window.BlackHole3D.Graphics.setViewCubeVisible(false);
    window.BlackHole3D.Graphics.setGeoCoordVisible(false);
  } catch (_e) {}
}

function locateCameraOnce() {
  if (engine.cameraLocated) {
    return;
  }
  try {
    window.BlackHole3D.Camera.setCamLocateDefault(1, true);
    engine.cameraLocated = true;
  } catch (_error) {
  }
}

function resetPlatformLoadState(dataSetConfigs) {
  engine.loadMode = "platform-seq";
  engine.pendingDataSetConfigs = [...dataSetConfigs];
  engine.loadedDataSetConfigs = [];
  engine.failedDataSetConfigs = [];
  engine.currentDataSetConfig = null;
  engine.currentDataSetIndex = 0;
  engine.platformTotalDataSetCount = dataSetConfigs.length;
  engine.cameraLocated = false;
  clearDataSetLoadTimer();
}

function loadDirectDataSets(dataSetConfigs) {
  engine.loadMode = "direct";
  engine.activeDataSetId = dataSetConfigs[0]?.dataSetId || "";
  window.BlackHole3D.Model.loadDataSet(dataSetConfigs, true);
}

function finishPlatformDataSetLoading() {
  clearDataSetLoadTimer();
  engine.currentDataSetConfig = null;
  const successCount = engine.loadedDataSetConfigs.length;
  const failCount = engine.failedDataSetConfigs.length;
  if (successCount > 0) {
    engine.loaded = true;
    engine.loadMode = "done";
    setEngineStatus(`${getSdkSummary()}，模型平台，已加载 ${successCount} 组，跳过 ${failCount} 组`);
    if (failCount > 0) {
      console.warn("[BlackHole] 以下模型已跳过：", engine.failedDataSetConfigs);
    }
    return;
  }
  engine.activeDataSetSource = "official";
  engine.usingLocal = false;
  setEngineStatus(`${getSdkSummary()}，平台模型全部失败，正在切换官方演示模型`);
  loadDirectDataSets([engine.fallbackDataSet]);
}

function restoreLoadedPlatformDataSets() {
  if (!engine.loadedDataSetConfigs.length) {
    setTimeout(loadNextPlatformDataSet, 250);
    return;
  }
  engine.loadMode = "platform-recover";
  setEngineStatus(`${getSdkSummary()}，模型平台，正在恢复已成功的 ${engine.loadedDataSetConfigs.length} 组`);
  startDataSetLoadTimer();
  try {
    window.BlackHole3D.Model.loadDataSet(engine.loadedDataSetConfigs, true);
  } catch (error) {
    console.warn("[BlackHole] 恢复已成功模型失败：", error);
    engine.loadedDataSetConfigs = [];
    engine.loadMode = "platform-seq";
    clearDataSetLoadTimer();
    setTimeout(loadNextPlatformDataSet, 250);
  }
}

function handlePlatformDataSetFailure(reason) {
  const config = engine.currentDataSetConfig;
  if (!config) {
    return;
  }
  clearDataSetLoadTimer();
  const failure = {
    name: getDataSetLabel(config, engine.currentDataSetIndex - 1),
    dataSetId: config.dataSetId || "",
    resId: config.resId || "",
    reason
  };
  engine.failedDataSetConfigs.push(failure);
  console.warn("[BlackHole] 模型加载失败，已跳过：", failure);
  engine.currentDataSetConfig = null;
  try {
    if (window.BlackHole3D?.Model?.getAllDataSetId?.()?.length) {
      window.BlackHole3D.Model.unloadAllDataSet();
    }
  } catch (_error) {
  }
  restoreLoadedPlatformDataSets();
}

function loadNextPlatformDataSet() {
  clearDataSetLoadTimer();
  if (!engine.pendingDataSetConfigs.length) {
    finishPlatformDataSetLoading();
    return;
  }
  const nextConfig = engine.pendingDataSetConfigs.shift();
  engine.currentDataSetConfig = nextConfig;
  engine.currentDataSetIndex = engine.loadedDataSetConfigs.length + engine.failedDataSetConfigs.length + 1;
  engine.activeDataSetId = nextConfig.dataSetId || nextConfig.resId || "";
  setEngineStatus(
    `${getSdkSummary()}，模型平台，逐组加载 ${engine.currentDataSetIndex}/${engine.platformTotalDataSetCount}：${getDataSetLabel(nextConfig, engine.currentDataSetIndex - 1)}`
  );
  startDataSetLoadTimer();
  try {
    window.BlackHole3D.Model.loadDataSet([nextConfig], true);
  } catch (error) {
    handlePlatformDataSetFailure(String(error));
  }
}

function startPlatformSequentialLoading(dataSetConfigs) {
  resetPlatformLoadState(dataSetConfigs);
  setEngineStatus(`${getSdkSummary()}，模型平台，已开始逐组加载（${dataSetConfigs.length} 组）`);
  loadNextPlatformDataSet();
}

function buildHugeModelContext(resId) {
  return `<scene>\n  <HugeModel Path="hugemodel/hlod_cache/0/${resId}/total.hugemodel" />\n</scene>`;
}

function buildPlatformDataSetConfig(item, index) {
  const request = item?.request || {};
  const resId = request.resId || item?.resId || "";
  const shareInfo = item?.shareInfo || {};
  const resourcesAddress = request.resourcesAddress || shareInfo.resourcesAddress || item?.resourcesAddress || "";
  const resourceId = (shareInfo.resourceId || "").replace(/-/g, "") || resId;
  const context = buildHugeModelContext(resId);
  if (!resId || !resourcesAddress) {
    return null;
  }
  return {
    name: item?.modelName || `模型_${index + 1}`,
    dataSetId: request.dataSetId || item?.dataSetId || resId,
    resId,
    resourceId,
    resourcesAddress,
    // Some SDK versions read context, some read dataSetSGContent.
    context,
    dataSetSGContent: context,
    token: shareInfo.token || "",
    projectZoneId: shareInfo.projectZoneId || "",
    protocol: request.protocol || "webem",
    dir: request.dir || "url_res04",
    filetimel: request.filetimel || "0",
    filetimeh: request.filetimeh || "0",
    packpath: request.packpath || "unknown",
    packtimel: request.packtimel || "0",
    packtimeh: request.packtimeh || "0",
    useTransInfo: true,
    transInfo: item?.transInfo || {
      scale: [1, 1, 1],
      rotate: [0, 0, 0],
      translation: [0, 0, 0]
    }
  };
}

async function tryLoadPlatformDataSets() {
  try {
    const resp = await fetch(engine.platformDataSetConfigUrl, { method: "GET" });
    if (!resp.ok) {
      return [];
    }
    const payload = await resp.json();
    if (!Array.isArray(payload)) {
      return [];
    }
    return payload
      .map(buildPlatformDataSetConfig)
      .filter(Boolean);
  } catch (_error) {
    return [];
  }
}

async function tryLoadLocalDataSet() {
  try {
    const resp = await fetch(`${engine.localDataSetPath}/total.xml`, { method: "GET" });
    if (resp.ok) {
      return [{
        dataSetId: "grain_local",
        resourcesAddress: engine.localDataSetPath,
        useTransInfo: false
      }];
    }
  } catch (_error) {
  }
  return [];
}

async function pickDataSetConfigs() {
  // dataSource=platform | local | official (default platform)
  const request = (engine.requestedDataSource || "").toLowerCase();
  if (request === "official") {
    engine.activeDataSetSource = "official";
    engine.usingLocal = false;
    return [engine.fallbackDataSet];
  }

  if (request === "local") {
    const localDataSets = await tryLoadLocalDataSet();
    if (localDataSets.length) {
      engine.activeDataSetSource = "local";
      engine.usingLocal = true;
      return localDataSets;
    }
    engine.activeDataSetSource = "official";
    engine.usingLocal = false;
    return [engine.fallbackDataSet];
  }

  const platformDataSets = await tryLoadPlatformDataSets();
  if (platformDataSets.length) {
    engine.activeDataSetSource = "platform";
    engine.usingLocal = false;
    return platformDataSets;
  }

  engine.activeDataSetSource = "official";
  engine.usingLocal = false;
  return [engine.fallbackDataSet];
}

function onResize() {
  if (!window.BlackHole3D || !el.canvas) {
    return;
  }
  window.BlackHole3D.m_re_em_window_width = window.innerWidth;
  window.BlackHole3D.m_re_em_window_height = window.innerHeight;
}

async function handleEngineCreated(e) {
  if (!e.detail || !e.detail.succeed) {
    setEngineStatus("场景初始化失败");
    return;
  }
  const dataSetConfigs = await pickDataSetConfigs();
  applyEngineRuntimeSettings();
  if (engine.activeDataSetSource === "platform") {
    startPlatformSequentialLoading(dataSetConfigs);
    return;
  }
  loadDirectDataSets(dataSetConfigs);
  if (engine.activeDataSetSource === "local") {
    setEngineStatus(`${getSdkSummary()}，模型本地，已开始加载`);
    return;
  }
  setEngineStatus(
    engine.requestedDataSource === "official"
      ? `${getSdkSummary()}，模型官方，已开始加载`
      : `${getSdkSummary()}，平台数据集不可用，已切到官方演示数据集`
  );
}

function initEngine() {
  const hasCreate = typeof window.CreateBlackHoleWebSDK === "function";
  if (!hasCreate) {
    const detail = "CreateBlackHoleWebSDK:missing";
    setEngineStatus(`SDK未加载成功（${detail}）`);
    return;
  }
  window.BlackHole3D = typeof window.BlackHole3D !== "undefined" ? window.BlackHole3D : {};
  window.BlackHole3D.canvas = el.canvas;
  window.BlackHole3D = window.CreateBlackHoleWebSDK(window.BlackHole3D);
  const hasEngineObj = !!window.BlackHole3D;
  const hasInit = typeof window.BlackHole3D?.initEngineSys === "function";
  const hasCommon = !!window.BlackHole3D?.Common;
  if (!hasEngineObj || !hasInit || !hasCommon) {
    const detail = [
      "CreateBlackHoleWebSDK:ok",
      hasEngineObj ? "BlackHole3D:ok" : "BlackHole3D:missing",
      hasInit ? "initEngineSys:ok" : "initEngineSys:missing",
      hasCommon ? "Common:ok" : "Common:missing"
    ].join(" | ");
    setEngineStatus(`SDK初始化异常（${detail}）`);
    return;
  }
  document.addEventListener("RESystemReady", () => {
    const sysInfo = new window.BlackHole3D.RESysInfo();
    sysInfo.workerjsPath = `${engine.sdkDir}/RealBIMWeb_Worker.js`;
    sysInfo.commonUrl = engine.commonUrl || null;
    sysInfo.renderWidth = el.canvas.clientWidth;
    sysInfo.renderHieght = el.canvas.clientHeight;
    window.BlackHole3D.initEngineSys(sysInfo);
    window.BlackHole3D.Common.setUseWebCache(true);
    setEngineStatus(`${getSdkSummary()}，引擎初始化完成`);
  });
  document.addEventListener("RESystemEngineCreated", handleEngineCreated);
  document.addEventListener("REDataSetLoadProgress", event => {
    const percent = event?.detail?.progress ?? 0;
    if (engine.loadMode === "platform-seq" && engine.currentDataSetConfig) {
      setEngineStatus(
        `${getSdkSummary()}，模型平台，${engine.currentDataSetIndex}/${engine.platformTotalDataSetCount} 组加载中 ${percent}%`
      );
      return;
    }
    if (engine.loadMode === "platform-recover") {
      setEngineStatus(
        `${getSdkSummary()}，模型平台，正在恢复已成功的 ${engine.loadedDataSetConfigs.length} 组 ${percent}%`
      );
      return;
    }
    setEngineStatus(`${getSdkSummary()}，${getDataSetSummary()}，模型加载中 ${percent}%`);
  });
  document.addEventListener("REDataSetLoadFinish", event => {
    const ok = event?.detail?.succeed;
    if (engine.loadMode === "platform-seq") {
      if (!ok) {
        handlePlatformDataSetFailure("SDK返回失败");
        return;
      }
      clearDataSetLoadTimer();
      if (engine.currentDataSetConfig) {
        engine.loadedDataSetConfigs.push(engine.currentDataSetConfig);
      }
      engine.currentDataSetConfig = null;
      engine.loaded = true;
      locateCameraOnce();
      setTimeout(loadNextPlatformDataSet, 250);
      return;
    }
    if (engine.loadMode === "platform-recover") {
      clearDataSetLoadTimer();
      engine.loadMode = "platform-seq";
      if (!ok) {
        console.warn("[BlackHole] 已成功模型恢复失败，继续尝试剩余模型");
        engine.loadedDataSetConfigs = [];
      } else {
        engine.loaded = engine.loadedDataSetConfigs.length > 0;
        locateCameraOnce();
      }
      setTimeout(loadNextPlatformDataSet, 250);
      return;
    }
    if (!ok) {
      setEngineStatus("模型加载失败");
      return;
    }
    engine.loaded = true;
    locateCameraOnce();
    setEngineStatus(`${getSdkSummary()}，${getDataSetSummary()}，模型加载完成，可交互浏览`);
    el.canvas.focus();
  });
  window.addEventListener("resize", onResize);
  window.addEventListener("beforeunload", () => {
    try {
      if (state.aiTimer) {
        clearInterval(state.aiTimer);
        state.aiTimer = null;
      }
      if (state.aiApiTimer) {
        clearInterval(state.aiApiTimer);
        state.aiApiTimer = null;
      }
      stopStream();
      if (window.BlackHole3D && window.BlackHole3D.Model.getAllDataSetId()?.length) {
        window.BlackHole3D.Model.unloadAllDataSet();
      }
      if (window.BlackHole3D) {
        window.BlackHole3D.releaseEngine();
      }
    } catch (_error) {
    }
  });
  onResize();
  engine.initialized = true;
}

function buildWarehouses(temperatureRows, sourceMaps) {
  const list = [];
  for (const r of temperatureRows.slice(0, 40)) {
    const id = safeText(r[1]);
    const name = safeText(r[2] || r[4] || `仓房${id || ""}`);
    const temperature = num(r[7], 20);
    const humidity = num(r[8], 60);
    const gas = num(r[9], 3);
    const height = num(r[13], 8);
    let deviceStatus = mapDeviceStatus(r[30]);
    const airRecord = sourceMaps.airById.get(id) || sourceMaps.airByName.get(name);
    const seed = hashNumber(`${id}-${name}`);
    const fallbackFan = 0.4 + (seed % 250) / 100;
    const fallbackAir = 0.3 + ((seed >> 8) % 220) / 100;
    const fanPower = airRecord ? airRecord.fan : fallbackFan;
    const airPower = airRecord ? airRecord.airConditioner : fallbackAir;
    const fanOn = fanPower > 0.8 || (airRecord?.mode || 0) >= 2;
    const airOn = airPower > 0.8;
    const pestScore = sourceMaps.pestById.get(id) || sourceMaps.pestByName.get(name) || 0;
    const hasPestRisk = pestScore > 0;
    const hasSteamTask = sourceMaps.steamById.has(id) || sourceMaps.steamByName.has(name);
    if (temperature > 30 || gas > 16) {
      deviceStatus = "故障";
    } else if (temperature > 26 && deviceStatus === "运行") {
      deviceStatus = "停机";
    }
    list.push({
      id,
      name,
      temperature,
      humidity,
      gas,
      height,
      deviceStatus,
      fanOn,
      airOn,
      hasPestRisk,
      hasSteamTask,
      pestScore,
      totalStock: num(r[11], 200) * 10,
      diagnosis: deviceStatus === "故障" ? "风机电流异常，建议切换备用设备并现场巡检" : deviceStatus === "停机" ? "计划停机或通信中断，建议检查联机状态" : "设备运行平稳"
    });
  }
  return list;
}

function renderQuickLocate() {
  const options = state.warehouses.map((w, i) => `<option value="${i}">${w.name}</option>`).join("");
  el.quickLocateSelect.innerHTML = `<option value="">快速定位仓房</option>${options}`;
}

function renderMap() {
  el.warehouseMap.innerHTML = "";
  state.warehouses.forEach((w, index) => {
    const b = document.createElement("button");
    b.className = "wh";
    const st = warehouseState(w);
    b.dataset.state = st;
    b.dataset.device = w.deviceStatus;
    b.dataset.pest = w.hasPestRisk ? "1" : "0";
    b.dataset.steam = w.hasSteamTask ? "1" : "0";
    const tags = [
      w.hasPestRisk ? "<span class=\"tag tag-pest\">虫害</span>" : "",
      w.hasSteamTask ? "<span class=\"tag tag-steam\">熏蒸</span>" : "",
      w.fanOn ? "<span class=\"tag tag-air\">通风</span>" : ""
    ].filter(Boolean).join("");
    b.innerHTML = `<div class="name">${w.name}</div><div class="state state-${st}">${st === "ok" ? "正常" : st === "warn" ? "关注" : "预警"}</div><div class="tags">${tags}</div>`;
    b.addEventListener("click", () => selectWarehouse(index));
    el.warehouseMap.appendChild(b);
  });
  selectWarehouse(0);
}

function setVisible(node, visible) {
  if (!node) return;
  node.classList.toggle("is-hidden", !visible);
}

function persistMenuSelection(main) {
  try {
    localStorage.setItem(menuMemoryKey, JSON.stringify({ main }));
  } catch (_error) {
  }
}

function restoreMenuSelection() {
  try {
    const raw = localStorage.getItem(menuMemoryKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.main) return null;
    return parsed;
  } catch (_error) {
    return null;
  }
}

function showExpandedOverlay() {
  if (el.expandedOverlay) el.expandedOverlay.classList.add("active");
}

function hideExpandedOverlay() {
  if (el.expandedOverlay) el.expandedOverlay.classList.remove("active");
}

function applyMainLayout(mainView) {
  // Show/hide panels based on data-views attribute
  document.querySelectorAll("[data-views]").forEach(panel => {
    const views = panel.dataset.views.split(/\s+/);
    const visible = views.includes(mainView);
    panel.style.display = visible ? "" : "none";
  });

  // Show/hide left and right sidebars
  const hasLeftContent = mainView !== "storage";
  const hasRightContent = mainView !== "storage";
  setVisible(el.hudLeft, hasLeftContent);
  setVisible(el.hudRight, hasRightContent);
  setVisible(el.hudBottom, true);
  hideExpandedOverlay();

  if (mainView === "api") {
    if (el.expandedTitle) el.expandedTitle.textContent = "接口联调与集成工具";
    showExpandedOverlay();
  }
}

function setMenuView(mainView) {
  const main = mainView || "dashboard";
  el.hudTabs.forEach(tab => tab.classList.toggle("active", tab.dataset.main === main));
  persistMenuSelection(main);
  applyMainLayout(main);
}

function bindMenuNavigation() {
  el.hudTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      setMenuView(tab.dataset.main || "dashboard");
    });
  });
}

function bindBreadcrumbNavigation() {
  // No breadcrumb in HUD mode
}

function updateClock() {
  if (!el.hudClock) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  el.hudClock.textContent = `${h}:${m}:${s}`;
}

function bindHudPanelToggles() {
  document.querySelectorAll(".hud-toggle").forEach(title => {
    title.addEventListener("click", () => {
      const panel = title.closest(".hud-collapsible");
      if (panel) panel.classList.toggle("collapsed");
    });
  });
  if (el.closeExpandedBtn) {
    el.closeExpandedBtn.addEventListener("click", hideExpandedOverlay);
  }
}

function getStatusDot(status) {
  const cls = status === "故障" ? "danger" : status === "停机" ? "warn" : "ok";
  return `<span class="status-dot ${cls}"></span>`;
}

function selectWarehouse(index) {
  state.currentIndex = index;
  const w = state.warehouses[index];
  const buttons = [...el.warehouseMap.querySelectorAll(".wh")];
  buttons.forEach((n, i) => n.classList.toggle("active", i === index));
  // Smooth scroll the active card into view
  const activeBtn = buttons[index];
  if (activeBtn) activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  el.dName.textContent = w.name;
  el.dTemp.textContent = w.temperature.toFixed(1);
  el.dHum.textContent = w.humidity.toFixed(1);
  el.dGas.textContent = w.gas.toFixed(1);
  el.dHeight.textContent = w.height.toFixed(1);
  const fanStatus = w.deviceStatus === "故障" ? "故障" : w.fanOn ? "运行" : "停机";
  const airStatus = w.airOn ? "运行" : "停机";
  el.dFan.innerHTML = `${getStatusDot(fanStatus)}${fanStatus}`;
  el.dAir.innerHTML = `${getStatusDot(airStatus)}${airStatus}`;
  el.quickLocateSelect.value = String(index);
  loadLedgerForWarehouse(index);
  if (warehouseState(w) !== "ok") {
    showSceneAlert(`${w.name} 触发预警：${w.diagnosis}`);
  }
}

function drawTempChart() {
  const ctx = el.tempChart.getContext("2d");
  const list = state.warehouses.slice(0, 12);
  const w = el.tempChart.width;
  const h = el.tempChart.height;
  ctx.clearRect(0, 0, w, h);
  // Transparent background for glassmorphism
  ctx.fillStyle = "rgba(8,23,51,0.35)";
  ctx.fillRect(0, 0, w, h);
  // Subtle grid lines
  ctx.strokeStyle = "rgba(64,158,255,0.08)";
  ctx.lineWidth = 0.5;
  for (let gy = 20; gy < h - 20; gy += 22) {
    ctx.beginPath();
    ctx.moveTo(20, gy);
    ctx.lineTo(w - 20, gy);
    ctx.stroke();
  }
  const values = list.map(i => i.temperature);
  const min = Math.min(...values, 10);
  const max = Math.max(...values, 35);
  const xStep = (w - 40) / (list.length - 1);
  // Area fill under line
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "rgba(75,192,255,0.25)");
  gradient.addColorStop(1, "rgba(75,192,255,0.02)");
  ctx.beginPath();
  list.forEach((item, i) => {
    const x = 20 + i * xStep;
    const y = h - 20 - ((item.temperature - min) / (max - min || 1)) * (h - 40);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(20 + (list.length - 1) * xStep, h - 20);
  ctx.lineTo(20, h - 20);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  // Line
  ctx.strokeStyle = "#4bc0ff";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(75,192,255,0.5)";
  ctx.shadowBlur = 6;
  ctx.beginPath();
  list.forEach((item, i) => {
    const x = 20 + i * xStep;
    const y = h - 20 - ((item.temperature - min) / (max - min || 1)) * (h - 40);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Points and labels
  ctx.fillStyle = "#8bc6ff";
  ctx.font = "11px Microsoft YaHei";
  list.forEach((item, i) => {
    const x = 20 + i * xStep;
    const y = h - 20 - ((item.temperature - min) / (max - min || 1)) * (h - 40);
    // Glow dot
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = item.temperature > 26 ? "#ff9f7f" : "#4bc0ff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = "rgba(200,220,255,0.8)";
    if (i % 2 === 0) {
      ctx.fillText(item.name.slice(0, 4), x - 12, h - 6);
    }
  });
}

function drawDeviceChart() {
  const ctx = el.deviceChart.getContext("2d");
  const w = el.deviceChart.width;
  const h = el.deviceChart.height;
  ctx.clearRect(0, 0, w, h);
  // Transparent background
  ctx.fillStyle = "rgba(8,23,51,0.35)";
  ctx.fillRect(0, 0, w, h);
  const run = state.warehouses.filter(i => i.deviceStatus === "运行").length;
  const stop = state.warehouses.filter(i => i.deviceStatus !== "运行").length;
  const warn = state.warehouses.filter(i => warehouseState(i) !== "ok").length;
  const items = [
    { name: "运行设备", value: run, color: "#61d88a", glow: "rgba(97,216,138,0.3)" },
    { name: "停机设备", value: stop, color: "#9aa9c7", glow: "rgba(154,169,199,0.3)" },
    { name: "异常仓房", value: warn, color: "#ff9f7f", glow: "rgba(255,159,127,0.3)" }
  ];
  const max = Math.max(...items.map(i => i.value), 1);
  items.forEach((item, i) => {
    const top = 18 + i * 32;
    const barWidth = ((w - 160) * item.value) / max;
    // Track
    ctx.fillStyle = "rgba(29,49,95,0.5)";
    const radius = 4;
    ctx.beginPath();
    ctx.roundRect(120, top, w - 160, 20, radius);
    ctx.fill();
    // Bar with glow
    if (barWidth > 0) {
      ctx.shadowColor = item.glow;
      ctx.shadowBlur = 8;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(120, top, Math.max(barWidth, 8), 20, radius);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // Labels
    ctx.fillStyle = "rgba(214,230,255,0.9)";
    ctx.font = "12px Microsoft YaHei";
    ctx.fillText(item.name, 18, top + 14);
    ctx.fillStyle = item.color;
    ctx.font = "bold 13px Orbitron, monospace";
    ctx.fillText(String(item.value), 126 + barWidth + 6, top + 15);
  });
}

function buildAlerts() {
  const alerts = [];
  state.warehouses.forEach((w, idx) => {
    if (w.temperature > 26) {
      alerts.push({ level: "粮情", text: `${w.name} 出现粮温偏高趋势`, warehouseIndex: idx });
    }
    if (w.deviceStatus !== "运行") {
      alerts.push({ level: "设备", text: `${w.name} 设备异常：${w.diagnosis}`, warehouseIndex: idx });
    }
    if (w.fanOn && w.temperature > 24) {
      alerts.push({ level: "通风", text: `${w.name} 通风系统运行中，建议持续关注温湿度回落`, warehouseIndex: idx });
    }
    if (w.hasPestRisk) {
      alerts.push({ level: "虫害", text: `${w.name} 发生虫情风险事件，虫害指数 ${w.pestScore}`, warehouseIndex: idx });
    }
    if (w.hasSteamTask) {
      alerts.push({ level: "熏蒸", text: `${w.name} 存在熏蒸作业记录`, warehouseIndex: idx });
    }
  });
  state.alerts = alerts.slice(0, 14);
  el.alertList.innerHTML = state.alerts.map((a, i) => `<div class="alert-item new" data-alert-index="${i}" data-level="${a.level}">[${a.level}] ${a.text}</div>`).join("");
  [...el.alertList.querySelectorAll(".alert-item")].forEach(item => {
    item.addEventListener("click", () => {
      const idx = Number(item.dataset.alertIndex);
      const alert = state.alerts[idx];
      if (!Number.isFinite(alert?.warehouseIndex)) {
        return;
      }
      selectWarehouse(alert.warehouseIndex);
      if (alert.level === "安防") {
        el.videoFusion?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      showSceneAlert(`${alert.level}联动：已定位到${state.warehouses[alert.warehouseIndex].name}`);
    });
  });
}

function renderSubsystems(customList) {
  const inOut = Math.round(state.warehouses.reduce((s, w) => s + w.height, 0) * 0.6);
  const run = state.warehouses.filter(w => w.fanOn || w.airOn).length;
  const pest = state.alerts.filter(a => a.level === "虫害").length;
  const steam = state.alerts.filter(a => a.level === "熏蒸").length;
  const mis = state.warehouses.length;
  const list = customList || [
    `粮情数据(cj_temperature)：采集 ${state.dataStats.temperatureRows} 条，当前预警 ${state.alerts.filter(a => a.level === "粮情").length} 条`,
    `通风数据(sg_ck_air)：作业记录 ${state.dataStats.airRows} 条，在线 ${Math.max(run, state.dataStats.airActiveWarehouses)} 仓`,
    `虫害数据(sg_ck_pest)：记录 ${state.dataStats.pestRows} 条，风险仓房 ${state.dataStats.pestRiskWarehouses} 个`,
    `熏蒸数据(sg_ck_steam)：作业记录 ${state.dataStats.steamRows} 条，涉及仓房 ${state.dataStats.steamTaskWarehouses} 个`,
    `子系统联动估算：今日车辆作业 ${inOut} 车次，虫害告警 ${pest} 条，熏蒸提醒 ${steam} 条，台账联动 ${mis} 条`
  ];
  el.subsystemList.innerHTML = list.map(i => `<div class="subsystem-item">${i}</div>`).join("");
}

function renderLedger(items) {
  const rows = items || [];
  el.ledgerPanel.innerHTML = rows.map(i => `<div class="subsystem-item">${i}</div>`).join("");
}

function renderAiEvents() {
  el.aiEventList.innerHTML = state.aiEvents.map((event, i) => `<div class="alert-item" data-ai-index="${i}">[${event.type}] ${event.text}</div>`).join("");
  [...el.aiEventList.querySelectorAll(".alert-item")].forEach(item => {
    item.addEventListener("click", () => {
      const idx = Number(item.dataset.aiIndex);
      const event = state.aiEvents[idx];
      if (!event) {
        return;
      }
      selectWarehouse(event.warehouseIndex);
      showSceneAlert(`安防联动：${event.text}`);
    });
  });
}

function flashKpiValue(element) {
  element.classList.remove("flash");
  void element.offsetWidth; // force reflow
  element.classList.add("flash");
}

function renderKPI() {
  const stock = state.warehouses.reduce((s, w) => s + w.totalStock, 0);
  const online = state.warehouses.filter(w => w.deviceStatus === "运行").length;
  const alerts = state.alerts.length;
  const ops = Math.round(state.warehouses.length * 2.8);
  const tempAvg = state.warehouses.reduce((s, w) => s + w.temperature, 0) / (state.warehouses.length || 1);
  const humAvg = state.warehouses.reduce((s, w) => s + w.humidity, 0) / (state.warehouses.length || 1);
  const newStock = `${Math.round(stock).toLocaleString()} 吨`;
  const newOnline = `${online}/${state.warehouses.length}`;
  const newAlerts = String(alerts);
  const newOps = `${ops} 单`;
  const newWeather = `${tempAvg.toFixed(1)}°C / ${humAvg.toFixed(1)}%`;
  // Flash animation on value change
  if (el.kpiStock.textContent !== newStock) { el.kpiStock.textContent = newStock; flashKpiValue(el.kpiStock); }
  if (el.kpiOnline.textContent !== newOnline) { el.kpiOnline.textContent = newOnline; flashKpiValue(el.kpiOnline); }
  if (el.kpiAlerts.textContent !== newAlerts) { el.kpiAlerts.textContent = newAlerts; flashKpiValue(el.kpiAlerts); }
  if (el.kpiTodayOps.textContent !== newOps) { el.kpiTodayOps.textContent = newOps; flashKpiValue(el.kpiTodayOps); }
  if (el.kpiWeather.textContent !== newWeather) { el.kpiWeather.textContent = newWeather; flashKpiValue(el.kpiWeather); }
}

function loadApiDraft() {
  try {
    const raw = localStorage.getItem("bh_api_debug_draft");
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    state.apiDraft = { ...state.apiDraft, ...parsed };
  } catch (_error) {
  }
}

function saveApiDraft() {
  try {
    localStorage.setItem("bh_api_debug_draft", JSON.stringify(state.apiDraft));
  } catch (_error) {
  }
}

function syncApiFormFromState() {
  el.apiBaseUrl.value = state.apiDraft.baseUrl;
  el.authMode.value = state.apiDraft.authMode;
  el.apiToken.value = state.apiDraft.token;
  el.apiClientId.value = state.apiDraft.clientId;
  el.apiSecretKey.value = state.apiDraft.secretKey;
  el.apiUserId.value = state.apiDraft.userId;
  el.tokenBodyInput.value = state.apiDraft.tokenBody;
  el.streamUrlInput.value = state.apiDraft.streamUrl;
  el.aiApiInput.value = state.apiDraft.aiApi;
  el.subsystemApiInput.value = state.apiDraft.subsystemApi;
  el.subsystemTypeSelect.value = state.apiDraft.subsystemType;
  el.ledgerApiInput.value = state.apiDraft.ledgerApi;
}

function collectApiFormToState() {
  state.apiDraft.baseUrl = (el.apiBaseUrl.value || "").trim();
  state.apiDraft.authMode = el.authMode.value;
  state.apiDraft.token = (el.apiToken.value || "").trim();
  state.apiDraft.clientId = (el.apiClientId.value || "").trim();
  state.apiDraft.secretKey = (el.apiSecretKey.value || "").trim();
  state.apiDraft.userId = (el.apiUserId.value || "").trim();
  state.apiDraft.tokenBody = (el.tokenBodyInput.value || "").trim();
  state.apiDraft.streamUrl = (el.streamUrlInput.value || "").trim();
  state.apiDraft.aiApi = (el.aiApiInput.value || "").trim();
  state.apiDraft.subsystemApi = (el.subsystemApiInput.value || "").trim();
  state.apiDraft.subsystemType = el.subsystemTypeSelect.value;
  state.apiDraft.ledgerApi = (el.ledgerApiInput.value || "").trim();
}

function getApiHeaders() {
  const headers = {
    "Content-Type": "application/json"
  };
  if (state.apiDraft.authMode === "token") {
    if (state.apiDraft.token) {
      headers.Authorization = state.apiDraft.token;
    }
  } else {
    if (state.apiDraft.clientId) headers.ClientId = state.apiDraft.clientId;
    if (state.apiDraft.secretKey) headers.SecretKey = state.apiDraft.secretKey;
    if (state.apiDraft.userId) headers.UserId = state.apiDraft.userId;
  }
  return headers;
}

function writeApiResponse(title, value) {
  el.apiResponsePreview.textContent = `${title}\n${typeof value === "string" ? value : JSON.stringify(value, null, 2)}`;
}

function collectObjects(input, bucket) {
  if (!input) {
    return;
  }
  if (Array.isArray(input)) {
    input.forEach(item => collectObjects(item, bucket));
    return;
  }
  if (typeof input === "object") {
    bucket.push(input);
    Object.values(input).forEach(value => collectObjects(value, bucket));
  }
}

function toProjectCandidate(obj, index) {
  if (!obj || typeof obj !== "object") {
    return null;
  }
  const id = obj.projectId || obj.id || obj.pid || obj.dcId || "";
  const name = obj.projectName || obj.name || obj.title || obj.secondName || `项目${index + 1}`;
  const dataSetId = obj.dataSetId || obj.datasetId || obj.dataSetID || obj.resId || "";
  const resourcesAddress = obj.resourcesAddress || obj.resourceAddress || obj.resAddress || obj.url || "";
  const lng = num(obj.lng ?? obj.longitude, NaN);
  const lat = num(obj.lat ?? obj.latitude, NaN);
  if (!id && !dataSetId && !resourcesAddress && !name) {
    return null;
  }
  return {
    id: String(id || index + 1),
    name: String(name),
    dataSetId: String(dataSetId || ""),
    resourcesAddress: String(resourcesAddress || ""),
    lng: Number.isFinite(lng) ? lng : null,
    lat: Number.isFinite(lat) ? lat : null,
    raw: obj
  };
}

function extractProjectCandidates(payload) {
  const objects = [];
  collectObjects(payload, objects);
  const candidates = [];
  objects.forEach((obj, index) => {
    const candidate = toProjectCandidate(obj, index);
    if (!candidate) {
      return;
    }
    if (!candidates.some(item => item.id === candidate.id && item.name === candidate.name && item.dataSetId === candidate.dataSetId && item.resourcesAddress === candidate.resourcesAddress)) {
      candidates.push(candidate);
    }
  });
  return candidates.slice(0, 80);
}

function renderProjectOptions() {
  if (!el.projectSelect) {
    return;
  }
  if (!state.projectCandidates.length) {
    el.projectSelect.innerHTML = "<option value=\"\">项目列表（未加载）</option>";
    return;
  }
  const options = state.projectCandidates.map((item, index) => {
    const loc = item.dataSetId || item.resourcesAddress ? "可加载场景" : "仅元数据";
    return `<option value="${index}">${item.name}（${loc}）</option>`;
  }).join("");
  el.projectSelect.innerHTML = `<option value="">选择项目并加载场景</option>${options}`;
}

async function loadSelectedProjectScene() {
  const index = Number(el.projectSelect.value);
  if (!Number.isFinite(index) || index < 0 || index >= state.projectCandidates.length) {
    writeApiResponse("加载项目场景失败", "请先从项目列表中选择一个可加载项目");
    return;
  }
  const item = state.projectCandidates[index];
  if (!item.dataSetId && !item.resourcesAddress) {
    writeApiResponse("加载项目场景失败", "该项目缺少 dataSetId/resourcesAddress 字段");
    return;
  }
  const dataSetConfig = {
    dataSetId: item.dataSetId || `project_${item.id}`,
    resourcesAddress: item.resourcesAddress || `${state.apiDraft.baseUrl.replace(/\/+$/, "")}/default.aspx?dir=url_res03&path=${item.dataSetId || item.id}`,
    useTransInfo: false
  };
  try {
    if (!window.BlackHole3D || !window.BlackHole3D.Model) {
      writeApiResponse("加载项目场景失败", "引擎尚未初始化完成");
      return;
    }
    const loaded = window.BlackHole3D.Model.getAllDataSetId?.() || [];
    if (loaded.length) {
      window.BlackHole3D.Model.unloadAllDataSet();
    }
    window.BlackHole3D.Model.loadDataSet([dataSetConfig], true);
    setEngineStatus(`正在加载项目场景：${item.name}`);
    writeApiResponse("项目场景加载已触发", { name: item.name, dataSetConfig });
  } catch (error) {
    writeApiResponse("加载项目场景失败", String(error));
  }
}

function makeApiDebugPreview() {
  collectApiFormToState();
  saveApiDraft();
  const baseUrl = state.apiDraft.baseUrl.replace(/\/+$/, "");
  const endpoint = "/blackHole3D/project/v3/list";
  const headers = getApiHeaders();
  el.headerPreview.textContent = `请求头:\n${JSON.stringify(headers, null, 2)}`;
  const curlHeaders = Object.entries(headers).map(([k, v]) => `-H \"${k}: ${v}\"`).join(" ");
  const apiUrl = `${baseUrl}${endpoint}`;
  const tokenUrl = `${baseUrl}/blackHole3D/basic/account/getToken`;
  el.curlPreview.textContent = `项目列表接口:\nGET ${apiUrl}\n\ncurl -X GET \"${apiUrl}\" ${curlHeaders}\n\n获取Token接口:\nPOST ${tokenUrl}\n\ncurl -X POST \"${tokenUrl}\" -H \"Content-Type: application/json\" -d '${state.apiDraft.tokenBody || "{}"}'`;
}

async function requestProjectList() {
  makeApiDebugPreview();
  const baseUrl = state.apiDraft.baseUrl.replace(/\/+$/, "");
  const apiUrl = `${baseUrl}/blackHole3D/project/v3/list`;
  try {
    writeApiResponse("请求中...", apiUrl);
    const resp = await fetch(apiUrl, {
      method: "GET",
      headers: getApiHeaders()
    });
    const text = await resp.text();
    let data = text;
    try {
      data = JSON.parse(text);
    } catch (_error) {
    }
    state.projectCandidates = extractProjectCandidates(data);
    renderProjectOptions();
    writeApiResponse(`项目列表响应（HTTP ${resp.status}）`, data);
  } catch (error) {
    state.projectCandidates = [];
    renderProjectOptions();
    writeApiResponse("项目列表请求失败", String(error));
  }
}

async function requestTopDemoList() {
  collectApiFormToState();
  saveApiDraft();
  const apiUrl = state.apiDraft.topDemoApi;
  try {
    writeApiResponse("请求中...", apiUrl);
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: "{}"
    });
    const text = await resp.text();
    let data = text;
    try {
      data = JSON.parse(text);
    } catch (_error) {
    }
    const candidates = extractProjectCandidates(data);
    if (candidates.length) {
      state.projectCandidates = candidates;
      renderProjectOptions();
    }
    writeApiResponse(`TopDemo响应（HTTP ${resp.status}）`, data);
  } catch (error) {
    writeApiResponse("TopDemo请求失败", String(error));
  }
}

async function requestToken() {
  makeApiDebugPreview();
  const baseUrl = state.apiDraft.baseUrl.replace(/\/+$/, "");
  const apiUrl = `${baseUrl}/blackHole3D/basic/account/getToken`;
  let payload = {};
  try {
    payload = JSON.parse(state.apiDraft.tokenBody || "{}");
  } catch (_error) {
    writeApiResponse("Token请求体JSON不合法", state.apiDraft.tokenBody || "");
    return;
  }
  try {
    writeApiResponse("请求中...", apiUrl);
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const text = await resp.text();
    let data = text;
    try {
      data = JSON.parse(text);
    } catch (_error) {
    }
    const maybeToken = data?.data?.tokenId || data?.data?.token || data?.tokenId || data?.token;
    if (maybeToken) {
      state.apiDraft.token = String(maybeToken);
      syncApiFormFromState();
      makeApiDebugPreview();
    }
    writeApiResponse(`Token响应（HTTP ${resp.status}）`, data);
  } catch (error) {
    writeApiResponse("Token请求失败", String(error));
  }
}

function stopStream() {
  if (state.streamPlayer) {
    try {
      state.streamPlayer.pause();
      state.streamPlayer.unload();
      state.streamPlayer.detachMediaElement();
      state.streamPlayer.destroy();
    } catch (_error) {
    }
    state.streamPlayer = null;
  }
  if (el.videoFusion) {
    el.videoFusion.pause();
    el.videoFusion.removeAttribute("src");
    el.videoFusion.load();
  }
}

function startStream() {
  collectApiFormToState();
  saveApiDraft();
  const url = state.apiDraft.streamUrl;
  if (!url) {
    writeApiResponse("实时流地址为空", "请先填写实时流地址");
    return;
  }
  stopStream();
  if (window.mpegts && window.mpegts.isSupported() && /\.flv($|\?)/i.test(url)) {
    try {
      const player = window.mpegts.createPlayer({
        type: "flv",
        isLive: true,
        url
      });
      state.streamPlayer = player;
      player.attachMediaElement(el.videoFusion);
      player.load();
      player.play();
      writeApiResponse("实时流播放中", `mpegts live: ${url}`);
      return;
    } catch (error) {
      writeApiResponse("mpegts播放失败", String(error));
      return;
    }
  }
  el.videoFusion.src = url;
  el.videoFusion.play().then(() => {
    writeApiResponse("视频播放中", url);
  }).catch(error => {
    writeApiResponse("视频播放失败", String(error));
  });
}

async function requestSubsystemData() {
  collectApiFormToState();
  saveApiDraft();
  if (!state.apiDraft.subsystemApi) {
    el.subsystemApiPreview.textContent = "未配置子系统接口，使用当前模拟联动数据";
    renderSubsystems();
    return;
  }
  const url = `${state.apiDraft.subsystemApi}${state.apiDraft.subsystemApi.includes("?") ? "&" : "?"}type=${state.apiDraft.subsystemType}`;
  try {
    el.subsystemApiPreview.textContent = `请求中: ${url}`;
    const resp = await fetch(url, { headers: getApiHeaders() });
    const text = await resp.text();
    let data = text;
    try {
      data = JSON.parse(text);
    } catch (_error) {
    }
    const list = Array.isArray(data?.data) ? data.data.map(i => String(i)) : null;
    if (list && list.length) {
      renderSubsystems(list);
    }
    el.subsystemApiPreview.textContent = `子系统接口响应（HTTP ${resp.status}）\n${typeof data === "string" ? data : JSON.stringify(data, null, 2)}`;
  } catch (error) {
    el.subsystemApiPreview.textContent = `子系统接口请求失败\n${String(error)}`;
  }
}

async function loadLedgerForWarehouse(index) {
  const w = state.warehouses[index];
  if (!w) {
    return;
  }
  collectApiFormToState();
  saveApiDraft();
  if (!state.apiDraft.ledgerApi) {
    renderLedger([
      `仓房: ${w.name}`,
      `资产编号: ZC-${w.id || "0000"}`,
      `粮食品种: 稻谷`,
      `仓容等级: A`,
      `责任人: 调度员-${(w.id || "0").toString().slice(-2)}`
    ]);
    return;
  }
  const url = `${state.apiDraft.ledgerApi}${state.apiDraft.ledgerApi.includes("?") ? "&" : "?"}warehouseId=${encodeURIComponent(w.id || "")}`;
  try {
    const resp = await fetch(url, { headers: getApiHeaders() });
    const text = await resp.text();
    let data = text;
    try {
      data = JSON.parse(text);
    } catch (_error) {
    }
    const rows = Array.isArray(data?.data)
      ? data.data.map(i => {
        if (typeof i === "string") {
          return i;
        }
        if (i && typeof i === "object") {
          const keys = Object.keys(i).slice(0, 8);
          return keys.map(key => `${key}: ${i[key]}`).join(" | ");
        }
        return JSON.stringify(i);
      })
      : [typeof data === "string" ? data : JSON.stringify(data)];
    renderLedger(rows.slice(0, 8));
  } catch (error) {
    renderLedger([`台账请求失败: ${String(error)}`]);
  }
}

function toggleAiSimulation() {
  if (state.aiTimer) {
    clearInterval(state.aiTimer);
    state.aiTimer = null;
    el.simulateAiBtn.textContent = "启动事件模拟";
    return;
  }
  const types = ["区域入侵", "明火烟雾", "未戴安全帽", "异常聚集"];
  state.aiTimer = setInterval(() => {
    if (!state.warehouses.length) {
      return;
    }
    const idx = Math.floor(Math.random() * state.warehouses.length);
    const type = types[Math.floor(Math.random() * types.length)];
    const text = `${state.warehouses[idx].name} 检测到${type}`;
    state.aiEvents.unshift({
      type: "安防AI",
      text,
      warehouseIndex: idx
    });
    state.aiEvents = state.aiEvents.slice(0, 20);
    renderAiEvents();
    selectWarehouse(idx);
    showSceneAlert(`AI事件：${text}`);
  }, 4500);
  el.simulateAiBtn.textContent = "停止事件模拟";
}

function clearAiEvents() {
  state.aiEvents = [];
  renderAiEvents();
}

function findWarehouseIndexByHint(hintId, hintName) {
  const id = safeText(hintId);
  const name = safeText(hintName);
  let idx = -1;
  if (id) {
    idx = state.warehouses.findIndex(item => safeText(item.id) === id);
  }
  if (idx < 0 && name) {
    idx = state.warehouses.findIndex(item => safeText(item.name) === name);
  }
  if (idx < 0 && state.warehouses.length) {
    idx = 0;
  }
  return idx;
}

function normalizeAiEvents(data) {
  const source = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return source.slice(0, 20).map((item, i) => {
    const type = item.type || item.eventType || item.alarmType || "安防AI";
    const text = item.text || item.message || item.content || `${type}事件${i + 1}`;
    const warehouseId = item.warehouseId || item.warehouseCode || item.houseId || "";
    const warehouseName = item.warehouseName || item.houseName || "";
    const streamUrl = item.streamUrl || item.videoUrl || item.url || "";
    const warehouseIndex = findWarehouseIndexByHint(warehouseId, warehouseName);
    return { type, text, warehouseIndex, streamUrl };
  });
}

async function pollAiEventsOnce() {
  collectApiFormToState();
  saveApiDraft();
  if (!state.apiDraft.aiApi) {
    writeApiResponse("AI接口未配置", "请先填写AI事件接口地址");
    return;
  }
  const resp = await fetch(state.apiDraft.aiApi, { headers: getApiHeaders() });
  const text = await resp.text();
  let data = text;
  try {
    data = JSON.parse(text);
  } catch (_error) {
  }
  const events = normalizeAiEvents(data);
  if (events.length) {
    state.aiEvents = events;
    renderAiEvents();
    const first = events[0];
    if (Number.isFinite(first.warehouseIndex) && first.warehouseIndex >= 0) {
      selectWarehouse(first.warehouseIndex);
    }
    if (first.streamUrl) {
      state.apiDraft.streamUrl = first.streamUrl;
      syncApiFormFromState();
      startStream();
    }
    showSceneAlert(`AI闭环联动：${first.text}`);
  }
  writeApiResponse(`AI事件接口响应（HTTP ${resp.status}）`, data);
}

function startAiApiPolling() {
  if (state.aiApiTimer) {
    clearInterval(state.aiApiTimer);
    state.aiApiTimer = null;
  }
  pollAiEventsOnce().catch(error => {
    writeApiResponse("AI事件接口请求失败", String(error));
  });
  const ms = Math.max(2500, num(state.apiDraft.aiPollMs, 6000));
  state.aiApiTimer = setInterval(() => {
    pollAiEventsOnce().catch(error => {
      writeApiResponse("AI事件接口请求失败", String(error));
    });
  }, ms);
}

function stopAiApiPolling() {
  if (state.aiApiTimer) {
    clearInterval(state.aiApiTimer);
    state.aiApiTimer = null;
  }
}

function setWeather(type) {
  state.weather = type;
  el.weatherOverlay.className = `weather-overlay weather-${type}`;
  if (!window.BlackHole3D || !window.BlackHole3D.SkyBox) {
    return;
  }
  if (type === "fog") {
    window.BlackHole3D.SkyBox.setSkyAtmActive(true);
    window.BlackHole3D.SkyBox.setSkyAtmFogAmp(1.4);
    return;
  }
  if (type === "rain") {
    window.BlackHole3D.SkyBox.setSkyAtmActive(true);
    window.BlackHole3D.SkyBox.setSkyAtmFogAmp(0.6);
    return;
  }
  if (type === "snow") {
    window.BlackHole3D.SkyBox.setSkyAtmActive(true);
    window.BlackHole3D.SkyBox.setSkyAtmFogAmp(0.8);
    return;
  }
  window.BlackHole3D.SkyBox.setSkyAtmActive(true);
  window.BlackHole3D.SkyBox.setSkyAtmFogAmp(0.25);
}

function stopRoam() {
  if (state.autoRoamTimer) {
    clearInterval(state.autoRoamTimer);
    state.autoRoamTimer = null;
  }
}

function setRoamMode(mode) {
  state.roamMode = mode;
  el.roamStatus.textContent = mode;
}

function startAutoRoam() {
  stopRoam();
  setRoamMode("自动巡检漫游");
  state.autoRoamTimer = setInterval(() => {
    const next = (state.currentIndex + 1) % state.warehouses.length;
    selectWarehouse(next);
    if (engine.loaded && window.BlackHole3D?.Camera) {
      const locType = [1, 2, 3][engine.autoCamStep % 3];
      engine.autoCamStep += 1;
      window.BlackHole3D.Camera.setCamLocateDefault(locType, true);
    }
  }, 1800);
}

function bindEvents() {
  bindMenuNavigation();
  bindBreadcrumbNavigation();
  bindHudPanelToggles();
  updateClock();
  setInterval(updateClock, 1000);
  el.weatherSelect.addEventListener("change", e => setWeather(e.target.value));
  el.quickLocateSelect.addEventListener("change", e => {
    if (e.target.value === "") {
      return;
    }
    const idx = Number(e.target.value);
    if (Number.isFinite(idx)) {
      selectWarehouse(idx);
      if (engine.loaded && window.BlackHole3D?.Camera) {
        window.BlackHole3D.Camera.setCamLocateDefault(1, true);
      }
    }
  });
  el.cutawayBtn.addEventListener("click", () => {
    state.cutaway = !state.cutaway;
    el.scene.classList.toggle("cutaway", state.cutaway);
    if (engine.loaded && window.BlackHole3D?.Common) {
      window.BlackHole3D.Common.setGhostState(state.cutaway);
    }
  });
  el.firstPersonBtn.addEventListener("click", () => {
    stopRoam();
    setRoamMode("第一人称漫游");
    selectWarehouse((state.currentIndex + 1) % state.warehouses.length);
    if (engine.loaded && window.BlackHole3D?.Camera) {
      window.BlackHole3D.Camera.setCamPreferFPS(true);
      window.BlackHole3D.Camera.setCamLocateDefault(1, true);
    }
  });
  el.autoRoamBtn.addEventListener("click", () => {
    if (state.autoRoamTimer) {
      stopRoam();
      setRoamMode("静态视角");
      if (engine.loaded && window.BlackHole3D?.Camera) {
        window.BlackHole3D.Camera.setCamPreferFPS(false);
      }
    } else {
      startAutoRoam();
    }
  });
  const apiInputs = [
    el.apiBaseUrl,
    el.authMode,
    el.apiToken,
    el.apiClientId,
    el.apiSecretKey,
    el.apiUserId,
    el.tokenBodyInput,
    el.streamUrlInput,
    el.aiApiInput,
    el.subsystemApiInput,
    el.subsystemTypeSelect,
    el.ledgerApiInput
  ].filter(Boolean);
  apiInputs.forEach(input => input.addEventListener("input", makeApiDebugPreview));
  if (el.buildHeaderBtn) el.buildHeaderBtn.addEventListener("click", makeApiDebugPreview);
  if (el.requestProjectBtn) el.requestProjectBtn.addEventListener("click", requestProjectList);
  if (el.requestTopDemoBtn) el.requestTopDemoBtn.addEventListener("click", requestTopDemoList);
  if (el.loadProjectSceneBtn) el.loadProjectSceneBtn.addEventListener("click", loadSelectedProjectScene);
  if (el.requestTokenBtn) el.requestTokenBtn.addEventListener("click", requestToken);
  if (el.startStreamBtn) el.startStreamBtn.addEventListener("click", startStream);
  if (el.stopStreamBtn) el.stopStreamBtn.addEventListener("click", stopStream);
  if (el.requestSubsystemBtn) el.requestSubsystemBtn.addEventListener("click", requestSubsystemData);
  if (el.loadLedgerBtn) el.loadLedgerBtn.addEventListener("click", () => loadLedgerForWarehouse(state.currentIndex));
  if (el.simulateAiBtn) el.simulateAiBtn.addEventListener("click", toggleAiSimulation);
  if (el.clearAiBtn) el.clearAiBtn.addEventListener("click", clearAiEvents);
  if (el.startAiApiBtn) el.startAiApiBtn.addEventListener("click", startAiApiPolling);
  if (el.stopAiApiBtn) el.stopAiApiBtn.addEventListener("click", stopAiApiPolling);
}

async function init() {
  loadApiDraft();
  syncApiFormFromState();
  buildModelList();
  bindEvents();
  const menuSelection = restoreMenuSelection();
  if (menuSelection) {
    setMenuView(menuSelection.main);
  } else {
    setMenuView("dashboard");
  }
  makeApiDebugPreview();
  renderLedger([]);
  renderAiEvents();
  renderProjectOptions();
  el.subsystemApiPreview.textContent = "子系统接口未请求";
  setWeather("sunny");
  initEngine();
  try {
    const [temperatureText, airText, pestText, steamText] = await Promise.all([
      fetchText(paths.temperature),
      fetchText(paths.air),
      fetchText(paths.pest),
      fetchText(paths.steam)
    ]);
    const temperatureRows = parseCSV(temperatureText);
    const airRows = parseCSV(airText);
    const pestRows = parseCSV(pestText);
    const steamRows = parseCSV(steamText);
    const sourceMaps = buildSourceMaps(temperatureRows, airRows, pestRows, steamRows);
    state.dataStats = sourceMaps.stats;
    state.warehouses = buildWarehouses(temperatureRows, sourceMaps);
    renderQuickLocate();
    renderMap();
    buildAlerts();
    renderSubsystems();
    renderKPI();
    drawTempChart();
    drawDeviceChart();
  } catch (e) {
    el.warehouseMap.innerHTML = "<div style='padding:10px;color:#ff8f8f'>数据加载失败，请确认从本地服务启动并且数据文件路径可访问。</div>";
  }
}

init();
