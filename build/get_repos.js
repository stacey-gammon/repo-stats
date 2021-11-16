"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepoStats = void 0;
var response_mock_1 = require("./response.mock");
var child_process_1 = require("child_process");
var path_1 = __importDefault(require("path"));
var os_1 = __importDefault(require("os"));
var fs_1 = __importDefault(require("fs"));
var js_yaml_1 = __importDefault(require("js-yaml"));
var pretty_bytes_1 = __importDefault(require("pretty-bytes"));
function getRepoStats(client, extraRepos) {
    return __awaiter(this, void 0, void 0, function () {
        var data, tempLargestReposCache, stats;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = { data: { items: [response_mock_1.TEST_REPO] } };
                    tempLargestReposCache = path_1.default.resolve(os_1.default.tmpdir(), 'largest_repo_cache');
                    if (!!fs_1.default.existsSync(tempLargestReposCache)) return [3 /*break*/, 2];
                    return [4 /*yield*/, client.search.repos({
                            q: "language:typescript size:>=400000 stars:>=1000",
                            sort: "stars",
                            order: "desc",
                            size: 1,
                            type: "all"
                        })];
                case 1:
                    data = (_a.sent());
                    fs_1.default.writeFileSync(tempLargestReposCache, JSON.stringify(data));
                    return [3 /*break*/, 3];
                case 2:
                    console.log("largest repos are cached");
                    data = JSON.parse(fs_1.default.readFileSync(tempLargestReposCache, { encoding: 'utf-8' }));
                    _a.label = 3;
                case 3: return [4 /*yield*/, Promise.all(extraRepos.map(function (_a) {
                        var owner = _a.owner, repo = _a.repo;
                        return __awaiter(_this, void 0, void 0, function () {
                            var extraRepoFilePath, repoData, repoData;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        console.log("Getting extra repo " + repo);
                                        extraRepoFilePath = path_1.default.resolve(os_1.default.tmpdir(), "extraRepoUrl" + owner + repo);
                                        if (!!fs_1.default.existsSync(extraRepoFilePath)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, client.repos.get({
                                                repo: repo,
                                                owner: owner
                                            })];
                                    case 1:
                                        repoData = _b.sent();
                                        fs_1.default.writeFileSync(extraRepoFilePath, JSON.stringify(data));
                                        data.data.items.push(repoData.data);
                                        return [3 /*break*/, 3];
                                    case 2:
                                        console.log("Extra repo " + repo + " is cached");
                                        repoData = JSON.parse(fs_1.default.readFileSync(extraRepoFilePath, { encoding: 'utf-8' }));
                                        data.data.items.push(repoData);
                                        _b.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        });
                    }))];
                case 4:
                    _a.sent();
                    stats = {};
                    return [4 /*yield*/, Promise.all(data.data.items
                            .map(function (repo) { return __awaiter(_this, void 0, void 0, function () {
                            var tempDir, output, tempCloc, cloc, clocStats;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        tempDir = path_1.default.resolve(os_1.default.tmpdir(), repo.name);
                                        console.log("cloning " + repo.html_url + " into " + tempDir);
                                        if (!!fs_1.default.existsSync(tempDir)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, (0, child_process_1.execSync)("git clone " + repo.html_url + " " + tempDir)];
                                    case 1:
                                        output = _a.sent();
                                        console.log(output);
                                        _a.label = 2;
                                    case 2:
                                        console.log('Running cloc now');
                                        tempCloc = path_1.default.resolve(os_1.default.tmpdir(), repo.name + '_cloc') + '.yaml';
                                        if (!!fs_1.default.existsSync(tempCloc)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, (0, child_process_1.execSync)("cloc --exclude-dir=node_modules " + tempDir + " --yaml --out " + tempCloc)];
                                    case 3:
                                        cloc = _a.sent();
                                        console.log(cloc);
                                        _a.label = 4;
                                    case 4:
                                        clocStats = js_yaml_1.default.load(fs_1.default.readFileSync(tempCloc, { encoding: 'utf-8' }));
                                        console.log("stats from " + tempCloc + " are:");
                                        console.log(clocStats);
                                        stats[repo.name] = {
                                            totalLOC: clocStats.SUM.code,
                                            tsLOC: clocStats.TypeScript.code,
                                            name: repo.name,
                                            url: repo.html_url,
                                            repoSizeRaw: repo.size,
                                            repoSize: (0, pretty_bytes_1.default)(repo.size * 1024)
                                        };
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 5:
                    _a.sent();
                    return [2 /*return*/, stats];
            }
        });
    });
}
exports.getRepoStats = getRepoStats;
//# sourceMappingURL=get_repos.js.map