can you please do some thorough research about this? 
Run corepack enable
  corepack enable
  shell: sh -e {0}
  env:
    HOME: /root
WARNING: Error loading config file: open /root/.docker/config.json: permission denied
/__w/_temp/a30e344f-6403-4832-b286-49acb036568a.sh: 1: corepack: not found
Error: Process completed with exit code 127.

2026-11-06T18:02:47.1805261Z Current runner version: '2.338.2'
2026-11-06T18:02:47.1831941Z ##[group]Runner Image Provisioner
2026-11-06T18:02:47.1832830Z Hosted Compute Agent
2026-11-06T18:02:47.1833792Z Version: 20261028.624
2026-11-06T18:02:47.1834566Z Commit: 54898b74c23fde5556c9b3c3a2290865feef0dfe
2026-11-06T18:02:47.1835348Z Build Date: 2026-10-28T21:51:42Z
2026-11-06T18:02:47.1836075Z Worker ID: {0033f670-ce4e-43d3-94d6-62485f4be98e}
2026-11-06T18:02:47.1836826Z Region: westus2
2026-11-06T18:02:47.1837389Z Cloud: Azure
2026-11-06T18:02:47.1838062Z ##[endgroup]
2026-11-06T18:02:47.1839549Z ##[group]Operating System
2026-11-06T18:02:47.1840303Z Ubuntu
2026-11-06T18:02:47.1840871Z 24.04.5
2026-11-06T18:02:47.1841394Z LTS
2026-11-06T18:02:47.1841969Z ##[endgroup]
2026-11-06T18:02:47.1842574Z ##[group]Runner Image
2026-11-06T18:02:47.1843356Z Image: ubuntu-24.04
2026-11-06T18:02:47.1844042Z Version: 20261101.360.1
2026-11-06T18:02:47.1845667Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20261101.360/images/ubuntu/Ubuntu2404-Readme.md
2026-11-06T18:02:47.1847413Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20261101.360
2026-11-06T18:02:47.1848397Z ##[endgroup]
2026-11-06T18:02:47.1851593Z ##[group]GITHUB_TOKEN Permissions
2026-11-06T18:02:47.1854426Z Actions: write
2026-11-06T18:02:47.1855090Z ArtifactMetadata: write
2026-11-06T18:02:47.1855714Z Attestations: write
2026-11-06T18:02:47.1856360Z Checks: write
2026-11-06T18:02:47.1856928Z CodeQuality: write
2026-11-06T18:02:47.1857609Z Contents: write
2026-11-06T18:02:47.1858204Z CopilotRequests: write
2026-11-06T18:02:47.1858805Z Deployments: write
2026-11-06T18:02:47.1859419Z Discussions: write
2026-11-06T18:02:47.1859984Z Drives: write
2026-11-06T18:02:47.1860548Z Issues: write
2026-11-06T18:02:47.1861259Z Metadata: read
2026-11-06T18:02:47.1861823Z Models: read
2026-11-06T18:02:47.1862414Z Packages: write
2026-11-06T18:02:47.1863048Z Pages: write
2026-11-06T18:02:47.1864034Z PullRequests: write
2026-11-06T18:02:47.1864749Z RepositoryProjects: write
2026-11-06T18:02:47.1865405Z SecurityEvents: write
2026-11-06T18:02:47.1866036Z Statuses: write
2026-11-06T18:02:47.1866640Z VulnerabilityAlerts: read
2026-11-06T18:02:47.1867292Z ##[endgroup]
2026-11-06T18:02:47.1869510Z Secret source: Actions
2026-11-06T18:02:47.1870496Z Cache mode: write
2026-11-06T18:02:47.1871349Z Prepare workflow directory
2026-11-06T18:02:47.2382168Z Prepare all required actions
2026-11-06T18:02:47.2430693Z Getting action download info
2026-11-06T18:02:47.5778646Z Download action repository 'actions/checkout@v7' (SHA:3d3c42e5aac5ba805825da76410c181273ba90b1)
2026-11-06T18:02:47.7140072Z Download action repository 'actions/setup-node@v7' (SHA:949feb2413d6458794dcd2491c4babbbce0c15c1)
2026-11-06T18:02:47.9350886Z Uses: kphoto/kphoto.github.io/.github/workflows/verify.yml@refs/heads/main (15d0d98eaceda8c677050e46396debc6d4ce5679)
2026-11-06T18:02:47.9355970Z Complete job name: verify / e2e
2026-11-06T18:02:48.0001256Z ##[group]Checking docker version
2026-11-06T18:02:48.0014968Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
2026-11-06T18:02:49.1439865Z '1.48'
2026-11-06T18:02:49.1462154Z Docker daemon API version: '1.48'
2026-11-06T18:02:49.1463702Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
2026-11-06T18:02:49.1857235Z '1.48'
2026-11-06T18:02:49.1877354Z Docker client API version: '1.48'
2026-11-06T18:02:49.1884836Z ##[endgroup]
2026-11-06T18:02:49.1889306Z ##[group]Clean up resources from previous jobs
2026-11-06T18:02:49.1896086Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=821f4b"
2026-11-06T18:02:49.2115776Z ##[command]/usr/bin/docker network prune --force --filter "label=821f4b"
2026-11-06T18:02:49.2280394Z ##[endgroup]
2026-11-06T18:02:49.2281712Z ##[group]Create local container network
2026-11-06T18:02:49.2294400Z ##[command]/usr/bin/docker network create --label 821f4b github_network_44811d5180f849ac9c53fe85c44f87ad
2026-11-06T18:02:49.2845732Z 94f342bf2765e769ba092339699a06af075faa4f4d86fa72db6fcb5e4591b9ed
2026-11-06T18:02:49.2872799Z ##[endgroup]
2026-11-06T18:02:49.2900569Z ##[group]Starting job container
2026-11-06T18:02:49.2925267Z ##[command]/usr/bin/docker pull mcr.microsoft.com/playwright:v1.64.1-noble
2026-11-06T18:02:49.4717341Z v1.64.1-noble: Pulling from playwright
2026-11-06T18:02:49.5167491Z 7a48b8f0e5c7: Already exists
2026-11-06T18:02:49.5290864Z 7f09f8b6ee13: Pulling fs layer
2026-11-06T18:02:49.5291705Z 1838e4eb65d9: Pulling fs layer
2026-11-06T18:02:49.5292336Z 6a04ac251623: Pulling fs layer
2026-11-06T18:02:49.5292832Z cc4939249994: Pulling fs layer
2026-11-06T18:02:49.5294041Z ec6213bdc8d0: Pulling fs layer
2026-11-06T18:02:49.5294595Z 81918556fc04: Pulling fs layer
2026-11-06T18:02:49.5295490Z ec6213bdc8d0: Waiting
2026-11-06T18:02:49.5296463Z 81918556fc04: Waiting
2026-11-06T18:02:49.5296966Z cc4939249994: Waiting
2026-11-06T18:02:49.5932085Z 1838e4eb65d9: Verifying Checksum
2026-11-06T18:02:49.5934464Z 1838e4eb65d9: Download complete
2026-11-06T18:02:50.0265907Z 7f09f8b6ee13: Verifying Checksum
2026-11-06T18:02:50.0273024Z 7f09f8b6ee13: Download complete
2026-11-06T18:02:50.5045856Z ec6213bdc8d0: Verifying Checksum
2026-11-06T18:02:50.5046516Z ec6213bdc8d0: Download complete
2026-11-06T18:02:50.5345566Z 6a04ac251623: Verifying Checksum
2026-11-06T18:02:50.5347020Z 6a04ac251623: Download complete
2026-11-06T18:02:50.7236699Z cc4939249994: Verifying Checksum
2026-11-06T18:02:50.7238351Z cc4939249994: Download complete
2026-11-06T18:02:51.0174992Z 81918556fc04: Verifying Checksum
2026-11-06T18:02:51.0175620Z 81918556fc04: Download complete
2026-11-06T18:02:57.2858284Z 7f09f8b6ee13: Pull complete
2026-11-06T18:02:57.3473897Z 1838e4eb65d9: Pull complete
2026-11-06T18:03:06.2500254Z 6a04ac251623: Pull complete
2026-11-06T18:03:10.9923615Z cc4939249994: Pull complete
2026-11-06T18:03:12.9508136Z ec6213bdc8d0: Pull complete
2026-11-06T18:03:14.7006863Z 81918556fc04: Pull complete
2026-11-06T18:03:14.7049600Z Digest: sha256:2f05f8a734509a7b3f26a912639488ee08f58a7b292d14d62271bcff9038768f
2026-11-06T18:03:14.7342430Z Status: Downloaded newer image for mcr.microsoft.com/playwright:v1.64.1-noble
2026-11-06T18:03:14.7351662Z mcr.microsoft.com/playwright:v1.64.1-noble
2026-11-06T18:03:14.7459817Z ##[command]/usr/bin/docker create --name a67748cc5bdd4b0d810d5f09e87880c5_mcrmicrosoftcomplaywrightv1641noble_5c30cd --label 821f4b --workdir /__w/kphoto.github.io/kphoto.github.io --network github_network_44811d5180f849ac9c53fe85c44f87ad --init --ipc=host -e "HOME=/github/home" -e GITHUB_ACTIONS=true -e CI=true -v "/var/run/docker.sock":"/var/run/docker.sock" -v "/home/runner/work":"/__w" -v "/home/runner/actions-runner/cached/2.338.2/externals":"/__e":ro -v "/home/runner/work/_temp":"/__w/_temp" -v "/home/runner/work/_actions":"/__w/_actions" -v "/opt/hostedtoolcache":"/__t" -v "/home/runner/work/_temp/_github_home":"/github/home" -v "/home/runner/work/_temp/_github_workflow":"/github/workflow" --entrypoint "tail" mcr.microsoft.com/playwright:v1.64.1-noble "-f" "/dev/null"
2026-11-06T18:03:14.7838588Z 1e4b30e15e24542a766279ed79e724e9853883eca1f3cf3cbdbe8f9cbfb42360
2026-11-06T18:03:14.7866419Z ##[command]/usr/bin/docker start 1e4b30e15e24542a766279ed79e724e9853883eca1f3cf3cbdbe8f9cbfb42360
2026-11-06T18:03:15.4275738Z 1e4b30e15e24542a766279ed79e724e9853883eca1f3cf3cbdbe8f9cbfb42360
2026-11-06T18:03:15.4298557Z ##[command]/usr/bin/docker ps --all --filter id=1e4b30e15e24542a766279ed79e724e9853883eca1f3cf3cbdbe8f9cbfb42360 --filter status=running --no-trunc --format "{{.ID}} {{.Status}}"
2026-11-06T18:03:15.4440786Z 1e4b30e15e24542a766279ed79e724e9853883eca1f3cf3cbdbe8f9cbfb42360 Up Less than a second
2026-11-06T18:03:15.4464606Z ##[command]/usr/bin/docker inspect --format "{{range .Config.Env}}{{println .}}{{end}}" 1e4b30e15e24542a766279ed79e724e9853883eca1f3cf3cbdbe8f9cbfb42360
2026-11-06T18:03:15.4615012Z HOME=/github/home
2026-11-06T18:03:15.4615606Z GITHUB_ACTIONS=true
2026-11-06T18:03:15.4615926Z CI=true
2026-11-06T18:03:15.4616262Z PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
2026-11-06T18:03:15.4617038Z LANG=C.UTF-8
2026-11-06T18:03:15.4617446Z LC_ALL=C.UTF-8
2026-11-06T18:03:15.4617936Z PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
2026-11-06T18:03:15.4641480Z ##[endgroup]
2026-11-06T18:03:15.4650914Z ##[group]Waiting for all services to be ready
2026-11-06T18:03:15.4652523Z ##[endgroup]
2026-11-06T18:03:15.4950325Z ##[group]Run actions/checkout@v7
2026-11-06T18:03:15.4950929Z with:
2026-11-06T18:03:15.4951175Z   repository: kphoto/kphoto.github.io
2026-11-06T18:03:15.4953871Z   token: ***
2026-11-06T18:03:15.4954091Z   ssh-strict: true
2026-11-06T18:03:15.4954303Z   ssh-user: git
2026-11-06T18:03:15.4954515Z   persist-credentials: true
2026-11-06T18:03:15.4954744Z   clean: true
2026-11-06T18:03:15.4954947Z   sparse-checkout-cone-mode: true
2026-11-06T18:03:15.4955197Z   fetch-depth: 1
2026-11-06T18:03:15.4955392Z   fetch-tags: false
2026-11-06T18:03:15.4955591Z   show-progress: true
2026-11-06T18:03:15.4955799Z   lfs: false
2026-11-06T18:03:15.4955981Z   submodules: false
2026-11-06T18:03:15.4956201Z   set-safe-directory: true
2026-11-06T18:03:15.4956452Z   allow-unsafe-pr-checkout: false
2026-11-06T18:03:15.4956952Z env:
2026-11-06T18:03:15.4957150Z   HOME: /root
2026-11-06T18:03:15.4957344Z ##[endgroup]
2026-11-06T18:03:15.5020049Z ##[command]/usr/bin/docker exec  1e4b30e15e24542a766279ed79e724e9853883eca1f3cf3cbdbe8f9cbfb42360 sh -c "cat /etc/*release | grep ^ID"
2026-11-06T18:03:15.6302604Z WARNING: Error loading config file: open /root/.docker/config.json: permission denied
2026-11-06T18:03:16.1206532Z Syncing repository: kphoto/kphoto.github.io
2026-11-06T18:03:16.1208161Z ##[group]Getting Git version info
2026-11-06T18:03:16.1208630Z Working directory is '/__w/kphoto.github.io/kphoto.github.io'
2026-11-06T18:03:16.1209305Z [command]/usr/bin/git version
2026-11-06T18:03:16.1291484Z git version 2.43.0
2026-11-06T18:03:16.1317565Z ##[endgroup]
2026-11-06T18:03:16.1331079Z Temporarily overriding HOME='/__w/_temp/8a9837cf-4439-47bd-b046-5aefbe4c9ed9' before making global git config changes
2026-11-06T18:03:16.1332387Z Adding repository directory to the temporary git global config as a safe directory
2026-11-06T18:03:16.1336903Z [command]/usr/bin/git config --global --add safe.directory /__w/kphoto.github.io/kphoto.github.io
2026-11-06T18:03:16.1374301Z Deleting the contents of '/__w/kphoto.github.io/kphoto.github.io'
2026-11-06T18:03:16.1378094Z ##[group]Determining repository object format
2026-11-06T18:03:16.1381239Z ##[endgroup]
2026-11-06T18:03:16.1381791Z ##[group]Initializing the repository
2026-11-06T18:03:16.1389455Z [command]/usr/bin/git init /__w/kphoto.github.io/kphoto.github.io
2026-11-06T18:03:16.1440134Z hint: Using 'master' as the name for the initial branch. This default branch name
2026-11-06T18:03:16.1443065Z hint: is subject to change. To configure the initial branch name to use in all
2026-11-06T18:03:16.1448701Z hint: of your new repositories, which will suppress this warning, call:
2026-11-06T18:03:16.1449716Z hint: 
2026-11-06T18:03:16.1451032Z hint: 	git config --global init.defaultBranch <name>
2026-11-06T18:03:16.1451665Z hint: 
2026-11-06T18:03:16.1452274Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
2026-11-06T18:03:16.1453433Z hint: 'development'. The just-created branch can be renamed via this command:
2026-11-06T18:03:16.1454190Z hint: 
2026-11-06T18:03:16.1454639Z hint: 	git branch -m <name>
2026-11-06T18:03:16.1455402Z Initialized empty Git repository in /__w/kphoto.github.io/kphoto.github.io/.git/
2026-11-06T18:03:16.1463426Z [command]/usr/bin/git remote add origin https://github.com/kphoto/kphoto.github.io
2026-11-06T18:03:16.1504551Z ##[endgroup]
2026-11-06T18:03:16.1505182Z ##[group]Disabling automatic garbage collection
2026-11-06T18:03:16.1508660Z [command]/usr/bin/git config --local gc.auto 0
2026-11-06T18:03:16.1554767Z ##[endgroup]
2026-11-06T18:03:16.1555382Z ##[group]Setting up auth
2026-11-06T18:03:16.1555676Z Removing SSH command configuration
2026-11-06T18:03:16.1556115Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2026-11-06T18:03:16.1590273Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2026-11-06T18:03:16.2336295Z Removing HTTP extra header
2026-11-06T18:03:16.2342938Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-11-06T18:03:16.2386704Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2026-11-06T18:03:16.2654263Z Removing includeIf entries pointing to credentials config files
2026-11-06T18:03:16.2659429Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-11-06T18:03:16.2706096Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
2026-11-06T18:03:16.2980251Z [command]/usr/bin/git config --file /__w/_temp/git-credentials-b30acc87-8260-4a9a-b96e-9efb520355c0.config http.https://github.com/.extraheader AUTHORIZATION: basic ***
2026-11-06T18:03:16.3031908Z [command]/usr/bin/git config --local includeIf.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git.path /__w/_temp/git-credentials-b30acc87-8260-4a9a-b96e-9efb520355c0.config
2026-11-06T18:03:16.3079428Z [command]/usr/bin/git config --local includeIf.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git/worktrees/*.path /__w/_temp/git-credentials-b30acc87-8260-4a9a-b96e-9efb520355c0.config
2026-11-06T18:03:16.3128646Z [command]/usr/bin/git config --local includeIf.gitdir:/github/workspace/.git.path /github/runner_temp/git-credentials-b30acc87-8260-4a9a-b96e-9efb520355c0.config
2026-11-06T18:03:16.3174710Z [command]/usr/bin/git config --local includeIf.gitdir:/github/workspace/.git/worktrees/*.path /github/runner_temp/git-credentials-b30acc87-8260-4a9a-b96e-9efb520355c0.config
2026-11-06T18:03:16.3219054Z ##[endgroup]
2026-11-06T18:03:16.3219748Z ##[group]Fetching the repository
2026-11-06T18:03:16.3226595Z [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +15d0d98eaceda8c677050e46396debc6d4ce5679:refs/remotes/origin/main
2026-11-06T18:03:50.0878642Z From https://github.com/kphoto/kphoto.github.io
2026-11-06T18:03:50.0879743Z  * [new ref]         15d0d98eaceda8c677050e46396debc6d4ce5679 -> origin/main
2026-11-06T18:03:50.0907559Z [command]/usr/bin/git branch --list --remote origin/main
2026-11-06T18:03:50.0947702Z   origin/main
2026-11-06T18:03:50.0955332Z [command]/usr/bin/git rev-parse refs/remotes/origin/main
2026-11-06T18:03:50.0991874Z 15d0d98eaceda8c677050e46396debc6d4ce5679
2026-11-06T18:03:50.0995819Z ##[endgroup]
2026-11-06T18:03:50.0996512Z ##[group]Determining the checkout info
2026-11-06T18:03:50.1000732Z ##[endgroup]
2026-11-06T18:03:50.1001333Z [command]/usr/bin/git sparse-checkout disable
2026-11-06T18:03:50.1052514Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
2026-11-06T18:03:50.1094750Z ##[group]Checking out the ref
2026-11-06T18:03:50.1097833Z [command]/usr/bin/git checkout --progress --force -B main refs/remotes/origin/main
2026-11-06T18:03:51.3177043Z Updating files:  74% (416/558)
2026-11-06T18:03:51.3283974Z Updating files:  75% (419/558)
2026-11-06T18:03:51.3287056Z Updating files:  76% (425/558)
2026-11-06T18:03:51.3295557Z Updating files:  77% (430/558)
2026-11-06T18:03:51.3296190Z Updating files:  78% (436/558)
2026-11-06T18:03:51.3299313Z Updating files:  79% (441/558)
2026-11-06T18:03:51.3303424Z Updating files:  80% (447/558)
2026-11-06T18:03:51.3308281Z Updating files:  81% (452/558)
2026-11-06T18:03:51.3312955Z Updating files:  82% (458/558)
2026-11-06T18:03:51.3317599Z Updating files:  83% (464/558)
2026-11-06T18:03:51.3321927Z Updating files:  84% (469/558)
2026-11-06T18:03:51.3324926Z Updating files:  85% (475/558)
2026-11-06T18:03:51.3331114Z Updating files:  86% (480/558)
2026-11-06T18:03:51.3337090Z Updating files:  87% (486/558)
2026-11-06T18:03:51.3339905Z Updating files:  88% (492/558)
2026-11-06T18:03:51.3345165Z Updating files:  89% (497/558)
2026-11-06T18:03:51.3348713Z Updating files:  90% (503/558)
2026-11-06T18:03:51.3353549Z Updating files:  91% (508/558)
2026-11-06T18:03:51.3365988Z Updating files:  92% (514/558)
2026-11-06T18:03:51.3366445Z Updating files:  93% (519/558)
2026-11-06T18:03:51.3366935Z Updating files:  94% (525/558)
2026-11-06T18:03:51.3367210Z Updating files:  95% (531/558)
2026-11-06T18:03:51.3386199Z Updating files:  96% (536/558)
2026-11-06T18:03:51.3386672Z Updating files:  97% (542/558)
2026-11-06T18:03:51.3387079Z Updating files:  98% (547/558)
2026-11-06T18:03:51.3387418Z Updating files:  99% (553/558)
2026-11-06T18:03:51.3387672Z Updating files: 100% (558/558)
2026-11-06T18:03:51.3388121Z Updating files: 100% (558/558), done.
2026-11-06T18:03:51.3405776Z Switched to a new branch 'main'
2026-11-06T18:03:51.3445937Z branch 'main' set up to track 'origin/main'.
2026-11-06T18:03:51.3683575Z ##[endgroup]
2026-11-06T18:03:51.3686787Z [command]/usr/bin/git log -1 --format=%H
2026-11-06T18:03:51.3727191Z 15d0d98eaceda8c677050e46396debc6d4ce5679
2026-11-06T18:03:51.4073948Z ##[group]Run corepack enable
2026-11-06T18:03:51.4074306Z [36;1mcorepack enable[0m
2026-11-06T18:03:51.4078155Z shell: sh -e {0}
2026-11-06T18:03:51.4078393Z env:
2026-11-06T18:03:51.4078580Z   HOME: /root
2026-11-06T18:03:51.4078778Z ##[endgroup]
2026-11-06T18:03:51.4244774Z WARNING: Error loading config file: open /root/.docker/config.json: permission denied
2026-11-06T18:03:51.4626299Z /__w/_temp/a30e344f-6403-4832-b286-49acb036568a.sh: 1: corepack: not found
2026-11-06T18:03:51.4672768Z ##[error]Process completed with exit code 127.
2026-11-06T18:03:51.4834993Z Post job cleanup.
2026-11-06T18:03:51.4842462Z ##[command]/usr/bin/docker exec  1e4b30e15e24542a766279ed79e724e9853883eca1f3cf3cbdbe8f9cbfb42360 sh -c "cat /etc/*release | grep ^ID"
2026-11-06T18:03:51.5500926Z WARNING: Error loading config file: open /root/.docker/config.json: permission denied
2026-11-06T18:03:51.6696128Z [command]/usr/bin/git version
2026-11-06T18:03:51.6737802Z git version 2.43.0
2026-11-06T18:03:51.6811156Z Temporarily overriding HOME='/__w/_temp/8c649cc4-03ff-44b6-bb82-926c073bb219' before making global git config changes
2026-11-06T18:03:51.6812871Z Adding repository directory to the temporary git global config as a safe directory
2026-11-06T18:03:51.6816808Z [command]/usr/bin/git config --global --add safe.directory /__w/kphoto.github.io/kphoto.github.io
2026-11-06T18:03:51.6855043Z Removing SSH command configuration
2026-11-06T18:03:51.6860442Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2026-11-06T18:03:51.6921250Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2026-11-06T18:03:51.7217147Z Removing HTTP extra header
2026-11-06T18:03:51.7222672Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-11-06T18:03:51.7267241Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2026-11-06T18:03:51.7579036Z Removing includeIf entries pointing to credentials config files
2026-11-06T18:03:51.7582598Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-11-06T18:03:51.7622601Z includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git.path
2026-11-06T18:03:51.7624534Z includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git/worktrees/*.path
2026-11-06T18:03:51.7625727Z includeif.gitdir:/github/workspace/.git.path
2026-11-06T18:03:51.7626581Z includeif.gitdir:/github/workspace/.git/worktrees/*.path
2026-11-06T18:03:51.7634409Z [command]/usr/bin/git config --local --get-all includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git.path
2026-11-06T18:03:51.7670592Z /__w/_temp/git-credentials-b30acc87-8260-4a9a-b96e-9efb520355c0.config
2026-11-06T18:03:51.7683974Z [command]/usr/bin/git config --local --unset includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git.path \/__w\/_temp\/git\-credentials\-b30acc87\-8260\-4a9a\-b96e\-9efb520355c0\.config
2026-11-06T18:03:51.7743229Z [command]/usr/bin/git config --local --get-all includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git/worktrees/*.path
2026-11-06T18:03:51.7781585Z /__w/_temp/git-credentials-b30acc87-8260-4a9a-b96e-9efb520355c0.config
2026-11-06T18:03:51.7795170Z [command]/usr/bin/git config --local --unset includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git/worktrees/*.path \/__w\/_temp\/git\-credentials\-b30acc87\-8260\-4a9a\-b96e\-9efb520355c0\.config
2026-11-06T18:03:51.7839037Z [command]/usr/bin/git config --local --get-all includeif.gitdir:/github/workspace/.git.path
2026-11-06T18:03:51.7874036Z /github/runner_temp/git-credentials-b30acc87-8260-4a9a-b96e-9efb520355c0.config
2026-11-06T18:03:51.7882861Z [command]/usr/bin/git config --local --unset includeif.gitdir:/github/workspace/.git.path \/github\/runner_temp\/git\-credentials\-b30acc87\-8260\-4a9a\-b96e\-9efb520355c0\.config
2026-11-06T18:03:51.7939076Z [command]/usr/bin/git config --local --get-all includeif.gitdir:/github/workspace/.git/worktrees/*.path
2026-11-06T18:03:51.7972987Z /github/runner_temp/git-credentials-b30acc87-8260-4a9a-b96e-9efb520355c0.config
2026-11-06T18:03:51.7981864Z [command]/usr/bin/git config --local --unset includeif.gitdir:/github/workspace/.git/worktrees/*.path \/github\/runner_temp\/git\-credentials\-b30acc87\-8260\-4a9a\-b96e\-9efb520355c0\.config
2026-11-06T18:03:51.8027797Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
2026-11-06T18:03:51.8291730Z Removing credentials config '/__w/_temp/git-credentials-b30acc87-8260-4a9a-b96e-9efb520355c0.config'
2026-11-06T18:03:51.8446743Z Stop and remove container: a67748cc5bdd4b0d810d5f09e87880c5_mcrmicrosoftcomplaywrightv1641noble_5c30cd
2026-11-06T18:03:51.8451429Z ##[command]/usr/bin/docker rm --force 1e4b30e15e24542a766279ed79e724e9853883eca1f3cf3cbdbe8f9cbfb42360
2026-11-06T18:03:53.1512483Z 1e4b30e15e24542a766279ed79e724e9853883eca1f3cf3cbdbe8f9cbfb42360
2026-11-06T18:03:53.1546642Z Remove container network: github_network_44811d5180f849ac9c53fe85c44f87ad
2026-11-06T18:03:53.1551243Z ##[command]/usr/bin/docker network rm github_network_44811d5180f849ac9c53fe85c44f87ad
2026-11-06T18:03:53.2568611Z github_network_44811d5180f849ac9c53fe85c44f87ad
2026-11-06T18:03:53.2645010Z Cleaning up orphan processes
looks like it started around november 2 
https://github.com/kphoto/kphoto.github.io/actions/runs/41452911898
november 1 run looks ok 
https://github.com/kphoto/kphoto.github.io/actions/runs/41303456778
nothing else has changed as far as I can tell 

**Analyzing the Workflow Failure**

I'm currently focused on the error "corepack: not found" that emerged during the GitHub Actions workflow. I'm carefully examining the logs to pinpoint the cause of this recent failure after `corepack enable` started failing. My immediate goal is to establish the context around this unexpected issue, and determine any relevant changes.


**Inspecting the Details**

I'm now diving into the specifics. I'm focusing on the Github workflow log, which points to a `verify.yml` file and a container image, specifically `mcr.microsoft.com/`. I'm starting to parse the path and looking for what the log reveals.


**Analyzing the Sequence**

I'm now tracing the execution flow. I see `actions/setup-node` downloading, followed by `actions/checkout`, then `corepack enable`. I need to figure out the exact timing. The log output is revealing the sequence. It seems that `corepack enable` comes *after* the checkout operation. A warning regarding Docker configuration pops up, though.


**Unraveling the Mystery**

I'm now zeroing in on the "corepack not found" error. It seems `actions/checkout` runs *before* `actions/setup-node`. I see `actions/checkout` runs inside the container. I see `setup-node` was *downloaded* earlier in the job, which means it should run at some point in the job. It's odd that it's failing on the 2nd but not the 1st. I'm focusing now on the container version. I need to find the specific Playwright version for `mcr.microsoft.com/playwright:v1.64.1-noble` and compare it to 1.49 and 1.50 and the latest.


**Analyzing Node Versions**

I'm now examining the Dockerfile, specifically the `NODE_VERSION` argument defined. It appears to be autogenerated, which is intriguing. I'm also referencing snippets 1.1.1 and 1.1.2. This should provide some useful information regarding the Node versioning process.


**Observing Node.js Update**

I've noticed that Playwright is updating its embedded Node.js version. Specifically, I'm observing the switch to the latest LTS line, which is indicated by the `Dockerfile.noble` and snippet 3.1.1. This is an interesting development and worth investigating further.


**Analyzing Corepack Removal**

I'm now digging into the removal of Corepack from recent Node.js versions, specifically 25 and beyond. I see that the Technical Steering Committee made the call in March 2025. It's now installed as a separate package, which is relevant to Playwright's Docker image builds, as seen in `Dockerfile.noble`. Given Node.js 26 is the target, I'm now curious when Playwright v1.64.1 was released or its image rebuilt, to see how they're handling Corepack.


**Pinpointing Playwright Node Upgrade**

I've determined the Node.js upgrade in the Playwright image, `mcr.microsoft.com/playwright:v1.64.1-noble`, occurred around November 2026. This inference comes from observing the dates of the user's logs and the image digest. Specifically, the runner downloaded a newer image, indicating a rebuild or retagging of the image, where Node.js 26 was incorporated. It looks like the November 1st run was successful, and that the upgrade happened in the subsequent runs.


**Investigating Corepack Failure**

I'm now focused on the "corepack: not found" error. It seems that with Node.js 25/26, the `corepack` binary is no longer included, due to the Technical Steering Committee's decision. This explains why the "corepack enable" command fails in the GitHub Actions workflow. I'm also now investigating the Docker permission warning. It looks like it's a common, harmless issue related to Docker CLI's attempts to read `/root/.docker/config.json` within the restricted GitHub Actions environment, which I suspect is triggered in several places during build execution.


**Confirming Corepack Fix**

I've confirmed the "corepack: not found" error, linked to Node.js 25/26 and the TSC decision. To fix this, I see that installing Corepack via npm before enabling is the best approach for this situation. Considering the job runs in a Playwright Docker container, using `npm install -g corepack` is the most direct solution. I'm now certain of the solution; other methods aren't as applicable.


**Summarizing November 2026 Shift**

I'm synthesizing the timeline of events. Node.js 26 entered Active LTS late October 2026. Simultaneously, Playwright's images migrated to Node 26 around the start of November. Since Node 25+, Corepack was removed, causing `corepack enable` failures in the GitHub Actions workflow, but the docker permission error is just noise.

### The Root Cause

Around November 1–2, 2026, **Node.js 26 reached Active LTS**, and Playwright updated its official Docker images (including `mcr.microsoft.com/playwright:v1.64.1-noble`) to use Node.js 26.

The key change behind the failure:
1. **Corepack was removed from Node.js starting in Node 25+**. The Node.js Technical Steering Committee (TSC) voted to stop bundling Corepack with Node.js. While Node 24 LTS and earlier still included it by default, Node 26 does not include Corepack out of the box.
2. Because Playwright updated its container image base to Node 26, the `corepack` executable is no longer present on `$PATH` inside the container.
3. When the workflow runs inside `mcr.microsoft.com/playwright:v1.64.1-noble`, executing `corepack enable` fails with:
   ```text
   corepack: not found
   Process completed with exit code 127.
   ```
*(Note: The `WARNING: Error loading config file: open /root/.docker/config.json: permission denied` log is a harmless red herring caused by GitHub Actions' container mount permissions; it did not cause the exit code 127).*

---

### How to Fix It

Depending on how package management is handled in the workflow, the following solutions resolve the error:

#### Option 1: Install Corepack via npm first (Recommended if using Corepack)
Install Corepack as a global npm package inside the container before enabling it:

```yaml
- name: Enable Corepack
  run: |
    npm install -g corepack
    corepack enable
```

#### Option 2: Install your package manager directly
If Corepack was only being used to access `pnpm` or `yarn`, install them directly via npm without Corepack:

* **For pnpm:**
  ```yaml
  - name: Install pnpm
    run: npm install -g pnpm
  ```
* **For Yarn:**
  ```yaml
  - name: Install Yarn
    run: npm install -g yarn
  ```

#### Option 3: Pin a base image or Node 24
If you want to stay on Node 24 until you are ready to adjust your workflow for Node 26, you can override/downgrade Node inside the container, or pin to a specific digest/tag that still used Node 24. However, **Option 1** or **Option 2** is the standard and future-proof fix for Node 25+.




































































































holy shit that is completely wrong because if it is right, how come it doesn't break for me locally? is it because I already have 1.64.1 locally so it is using the older container image? 

**Analyzing Local vs CI**

I'm now investigating a discrepancy between my local environment and the CI environment. The recent unexpected behavior is puzzling. My current hypothesis centers on potential version differences – I suspect my local installation of 1.64.1 might be the reason for the lack of breakage. I will continue investigating the local and CI setup to understand the differing behavior.


**Examining Compose Setup**

I'm now diving into the `compose.yaml` file, focusing on the `e2e` service definition. I found the command used is `['bash', '-c', 'corepack enable && ./scripts/build.sh && ./scripts/test-e2e.sh']`. This is the local setup. I'm trying to determine why podman-compose is used locally.


**Investigating Image Caching**

I'm now focusing on image caching. My recent thought process led me to examine how Podman behaves with the Playwright image. I confirmed that `podman compose run` checks for the image's local existence before pulling, unless explicitly instructed to pull. This means the version in the cache is critical. I'm now verifying the exact contents of `mcr.microsoft.com/playwright:v1.64.1-noble` and if it has been updated, especially its Node version. I'm also confirming that the CI environment also uses the image `mcr.microsoft.com/playwright:v1.64.1-noble`.


**Observing Workflow Steps**

I'm now fixated on the `verify.yml` workflow, specifically the order of operations in the `checks` and `e2e` jobs. I've noted the `checks` job's sequence: checkout, corepack enable, and Node setup. I'm also examining the runner environment, particularly the pre-installed Node version on the `ubuntu-latest` runner, as this is a potential source of discrepancy. I am now trying to fully understand how this contrasts with the local environment.


**Pinpointing Path Discrepancy**

I've just spotted something crucial in the logs. The CI runner pulls the Playwright image, and there's a permission denied error related to `/root/.docker/config.json`. This looks like a significant path-related discrepancy. The image is downloaded, but there's a permissions problem. I'm focusing on why this happens in the CI. I am now double-checking the command paths used on the local setup.


**Analyzing Playwright's Repository**

I'm focused on the Playwright repository and its product image. Specifically, I'm examining versions, like v1.64.1-noble-amd64, and the last push date, along with the pull counts, which is quite impressive at 558M+. It seems to have been updated recently.


**Investigating Image Caching**

I'm now digging into the image caching behavior. It seems the user's local Fedora setup, when pulling `mcr.microsoft.com/playwright:v1.64.1-noble` around October 2026, would have captured an image with Node 24. Subsequent local `podman compose` runs would use this cached image. In contrast, GitHub Actions runners, being ephemeral VMs, always fetch the latest version.


**Examining CI/CD Runs**

I've been analyzing the CI/CD runs and the image pulls. It appears that Docker on GitHub Actions consistently fetches a new version of the Playwright image, specifically the update from 11/01/2026 with Node 26. A local pull today would replicate the same issue. It has made me wonder why `setup-node` is executed after `corepack enable` in `verify.yml`.


**Reviewing Script Order**

I'm now focusing on the order of operations within the CI/CD scripts. I've noticed the unusual sequencing in `verify.yml`: `corepack enable` is run *before* `actions/setup-node`. It seems the intention was to leverage the pre-installed `corepack` within the `mcr.microsoft.com/playwright:v1.64.1-noble` image, which included Node 24. This contrasts with `compose.yaml`, where `setup-node` is omitted entirely and it directly calls `corepack enable`.

**Yes, that is exactly why.**

### Why It Passes Locally for You

In `check.sh` and `compose.yaml`, step 8 runs:
```bash
podman compose run --rm e2e
```
Because the image `mcr.microsoft.com/playwright:v1.64.1-noble` was already pulled to your Fedora machine back in October (when you updated to 1.64.1), **Podman uses your locally cached image** and never checks for updates unless explicitly told to `--pull`.

In your local image from October, Node was still **Node 24 LTS**, where `corepack` was bundled.

### Why It Fails in GitHub Actions

GitHub Actions runners are ephemeral. On every CI run, Docker executes a fresh pull from Microsoft Artifact Registry:
```text
2026-11-06T18:02:49.2925267Z ##[command]/usr/bin/docker pull mcr.microsoft.com/playwright:v1.64.1-noble
2026-11-06T18:03:14.7342430Z Status: Downloaded newer image for mcr.microsoft.com/playwright:v1.64.1-noble
```
Microsoft pushed an updated build of the `v1.64.1-noble` tag on **November 1, 2026**. In this updated build, Playwright rolled its base Node version to **Node 26** (the new LTS). 

Because Node.js stopped bundling Corepack in Node 25+, the new container image no longer contains the `corepack` binary on `$PATH`.

---

### You Can Verify This Locally in 10 Seconds

Run this on your terminal right now:
```bash
podman run --rm mcr.microsoft.com/playwright:v1.64.1-noble node -v
podman run --rm mcr.microsoft.com/playwright:v1.64.1-noble which corepack
```
You will see that your local copy is running **Node 24** and has `/usr/bin/corepack` (or `/usr/local/bin/corepack`).

If you then run:
```bash
podman pull mcr.microsoft.com/playwright:v1.64.1-noble
```
Podman will fetch the 11/01/2026 build. If you run `./check.sh` after that, **it will fail locally with the exact same exit code 127**.

---

### How to Fix It

You have two clean options in your repository:

#### 1. In `.github/workflows/verify.yml` and `compose.yaml`: Install Corepack before enabling it
In `.github/workflows/verify.yml`:
```yaml
    steps:
      - name: Check out
        uses: actions/checkout@v7

      - name: Enable corepack (yarn)
        run: |
          npm install -g corepack
          corepack enable
```

And in `compose.yaml`:
```yaml
services:
  e2e:
    <<: *base
    command: ['bash', '-c', 'npm install -g corepack && corepack enable && ./scripts/build.sh && ./scripts/test-e2e.sh']
```

#### 2. Reorder `setup-node` in `.github/workflows/verify.yml`
Notice that in `.github/workflows/verify.yml`, you had:
```yaml
      - name: Enable corepack (yarn)
        run: corepack enable

      - name: Set up Node 24
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: yarn
```
`corepack enable` was being called **before** `setup-node` provisioned Node 24. However, inside container jobs, `actions/setup-node` does not manage system binaries the same way it does on the VM host. Running `npm install -g corepack` is the most reliable approach across both `podman-compose` locally and GitHub Actions container jobs.
