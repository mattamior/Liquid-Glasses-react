# Repository Workflow Notes（仓库工作说明）

## Documentation After Every Completed Work Batch

After every completed work batch（完成工作批次）, update the documentation that
describes the affected behavior, public surface（公开界面）, operation, or
decision. Do this as part of finishing the batch, before reporting it complete.

A substantial（重要） batch changes project identity, user-visible behavior,
architecture（架构）, data model（数据模型）, public route（公开路由）, external
integration（外部集成）, release status（发布状态）, or a multi-file
implementation（多文件实现）. For a substantial batch, create or update a
structurally equivalent（结构一致） bilingual decision record under
`docs/decisions/`. For a lightweight（轻量） batch, update at least the most
relevant existing document; a new decision record is not required for a
spelling, formatting, or isolated mechanical edit.

Each record must include:

- scope and decision;
- delivered result and changed areas;
- exact verification evidence（验证证据）;
- deployment or release status（部署或发布状态）;
- known risks, limits, and follow-up work（后续工作）.

Add or update a README link when a batch changes the current project identity,
behavior, architecture, public surface（公开界面）, public route（公开路由）, or
operating status. Keep English and Chinese records structurally equivalent
（结构一致）. Do not claim a deployment, release, or test result that was not
actually verified.

## 每个完成工作批次后的文档

每次完成一个工作批次后，必须更新描述受影响行为、公开界面、运行方式或决策的
相关文档。该更新属于批次完成条件，必须在报告完成前完成。

重要批次是指改变项目身份、用户可见行为、架构、数据模型、公开路由、外部集成、
发布状态，或涉及多文件实现的工作。重要批次必须在 `docs/decisions/` 下新增或
更新一对结构一致的中英文决策记录。轻量批次至少更新最相关的现有文档；小型文案、
格式调整或孤立机械修改不要求新建决策记录。

每份记录必须包含：

- 范围与决策；
- 交付结果与改动区域；
- 精确的验证证据；
- 部署或发布状态；
- 已知风险、限制与后续工作。

当批次改变当前项目身份、行为、架构、公开界面、公开路由或运行状态时，必须
新增或更新 README 链接。中英文记录的结构必须一致；未实际验证的部署、发布或
测试结果不得写成已完成。
