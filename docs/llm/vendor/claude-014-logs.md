2026-11-06T18:26:06.7535123Z Current runner version: '2.338.2'
2026-11-06T18:26:06.7557498Z ##[group]Runner Image Provisioner
2026-11-06T18:26:06.7558230Z Hosted Compute Agent
2026-11-06T18:26:06.7558828Z Version: 20261028.624
2026-11-06T18:26:06.7559432Z Commit: 54898b74c23fde5556c9b3c3a2290865feef0dfe
2026-11-06T18:26:06.7560031Z Build Date: 2026-10-28T21:51:42Z
2026-11-06T18:26:06.7560674Z Worker ID: {09d3bca0-547f-4184-941d-0121a684c926}
2026-11-06T18:26:06.7561278Z Region: westus2
2026-11-06T18:26:06.7561797Z Cloud: Azure
2026-11-06T18:26:06.7562278Z ##[endgroup]
2026-11-06T18:26:06.7563368Z ##[group]Operating System
2026-11-06T18:26:06.7563949Z Ubuntu
2026-11-06T18:26:06.7564405Z 24.04.5
2026-11-06T18:26:06.7564863Z LTS
2026-11-06T18:26:06.7565401Z ##[endgroup]
2026-11-06T18:26:06.7565873Z ##[group]Runner Image
2026-11-06T18:26:06.7566751Z Image: ubuntu-24.04
2026-11-06T18:26:06.7567246Z Version: 20261101.360.1
2026-11-06T18:26:06.7568540Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20261101.360/images/ubuntu/Ubuntu2404-Readme.md
2026-11-06T18:26:06.7569791Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20261101.360
2026-11-06T18:26:06.7570619Z ##[endgroup]
2026-11-06T18:26:06.7573136Z ##[group]GITHUB_TOKEN Permissions
2026-11-06T18:26:06.7575023Z Actions: write
2026-11-06T18:26:06.7575586Z ArtifactMetadata: write
2026-11-06T18:26:06.7576143Z Attestations: write
2026-11-06T18:26:06.7576658Z Checks: write
2026-11-06T18:26:06.7577176Z CodeQuality: write
2026-11-06T18:26:06.7578056Z Contents: write
2026-11-06T18:26:06.7578546Z CopilotRequests: write
2026-11-06T18:26:06.7579031Z Deployments: write
2026-11-06T18:26:06.7579569Z Discussions: write
2026-11-06T18:26:06.7580077Z Drives: write
2026-11-06T18:26:06.7580595Z Issues: write
2026-11-06T18:26:06.7581188Z Metadata: read
2026-11-06T18:26:06.7581640Z Models: read
2026-11-06T18:26:06.7582180Z Packages: write
2026-11-06T18:26:06.7582682Z Pages: write
2026-11-06T18:26:06.7583161Z PullRequests: write
2026-11-06T18:26:06.7583689Z RepositoryProjects: write
2026-11-06T18:26:06.7584214Z SecurityEvents: write
2026-11-06T18:26:06.7584740Z Statuses: write
2026-11-06T18:26:06.7585262Z VulnerabilityAlerts: read
2026-11-06T18:26:06.7585829Z ##[endgroup]
2026-11-06T18:26:06.7587700Z Secret source: Actions
2026-11-06T18:26:06.7588442Z Cache mode: write
2026-11-06T18:26:06.7589140Z Prepare workflow directory
2026-11-06T18:26:06.7930466Z Prepare all required actions
2026-11-06T18:26:06.7971785Z Getting action download info
2026-11-06T18:26:07.1249627Z Download action repository 'actions/checkout@v7' (SHA:3d3c42e5aac5ba805825da76410c181273ba90b1)
2026-11-06T18:26:07.2749010Z Download action repository 'actions/setup-node@v7' (SHA:949feb2413d6458794dcd2491c4babbbce0c15c1)
2026-11-06T18:26:07.4820668Z Uses: kphoto/kphoto.github.io/.github/workflows/verify.yml@refs/heads/main (34359635f83e172bc228417c3d64dd08e503447a)
2026-11-06T18:26:07.4824799Z Complete job name: verify / e2e
2026-11-06T18:26:07.5320948Z ##[group]Checking docker version
2026-11-06T18:26:07.5331779Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
2026-11-06T18:26:07.6559892Z '1.48'
2026-11-06T18:26:07.6572859Z Docker daemon API version: '1.48'
2026-11-06T18:26:07.6573562Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
2026-11-06T18:26:07.6738639Z '1.48'
2026-11-06T18:26:07.6753760Z Docker client API version: '1.48'
2026-11-06T18:26:07.6759172Z ##[endgroup]
2026-11-06T18:26:07.6761825Z ##[group]Clean up resources from previous jobs
2026-11-06T18:26:07.6766383Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=e51275"
2026-11-06T18:26:07.6921767Z ##[command]/usr/bin/docker network prune --force --filter "label=e51275"
2026-11-06T18:26:07.7059596Z ##[endgroup]
2026-11-06T18:26:07.7060151Z ##[group]Create local container network
2026-11-06T18:26:07.7068932Z ##[command]/usr/bin/docker network create --label e51275 github_network_287335dd884b4e42883da97d23f8b24e
2026-11-06T18:26:07.7610072Z 57ec25eef0a8a42836d4d017ff40358b46a102c577a144cb4847222470ae8328
2026-11-06T18:26:07.7629596Z ##[endgroup]
2026-11-06T18:26:07.7651048Z ##[group]Starting job container
2026-11-06T18:26:07.7669065Z ##[command]/usr/bin/docker pull mcr.microsoft.com/playwright:v1.64.1-noble
2026-11-06T18:26:07.9163080Z v1.64.1-noble: Pulling from playwright
2026-11-06T18:26:07.9958415Z 7a48b8f0e5c7: Already exists
2026-11-06T18:26:07.9987047Z 7f09f8b6ee13: Pulling fs layer
2026-11-06T18:26:07.9989008Z 1838e4eb65d9: Pulling fs layer
2026-11-06T18:26:07.9989889Z 6a04ac251623: Pulling fs layer
2026-11-06T18:26:07.9990512Z cc4939249994: Pulling fs layer
2026-11-06T18:26:07.9991013Z ec6213bdc8d0: Pulling fs layer
2026-11-06T18:26:07.9991411Z 81918556fc04: Pulling fs layer
2026-11-06T18:26:07.9992023Z ec6213bdc8d0: Waiting
2026-11-06T18:26:07.9992981Z 81918556fc04: Waiting
2026-11-06T18:26:08.0968154Z 1838e4eb65d9: Verifying Checksum
2026-11-06T18:26:08.0969458Z 1838e4eb65d9: Download complete
2026-11-06T18:26:08.4838852Z 7f09f8b6ee13: Verifying Checksum
2026-11-06T18:26:08.4840268Z 7f09f8b6ee13: Download complete
2026-11-06T18:26:08.9447868Z ec6213bdc8d0: Verifying Checksum
2026-11-06T18:26:08.9448943Z ec6213bdc8d0: Download complete
2026-11-06T18:26:08.9573416Z 6a04ac251623: Verifying Checksum
2026-11-06T18:26:08.9574674Z 6a04ac251623: Download complete
2026-11-06T18:26:09.1350711Z cc4939249994: Verifying Checksum
2026-11-06T18:26:09.1351946Z cc4939249994: Download complete
2026-11-06T18:26:09.3709777Z 81918556fc04: Verifying Checksum
2026-11-06T18:26:09.3710902Z 81918556fc04: Download complete
2026-11-06T18:26:20.7752581Z 7f09f8b6ee13: Pull complete
2026-11-06T18:26:20.8269600Z 1838e4eb65d9: Pull complete
2026-11-06T18:26:31.0431154Z 6a04ac251623: Pull complete
2026-11-06T18:26:37.7724657Z cc4939249994: Pull complete
2026-11-06T18:26:40.6396192Z ec6213bdc8d0: Pull complete
2026-11-06T18:26:43.7251878Z 81918556fc04: Pull complete
2026-11-06T18:26:43.7433592Z Digest: sha256:2f05f8a734509a7b3f26a912639488ee08f58a7b292d14d62271bcff9038768f
2026-11-06T18:26:43.7446297Z Status: Downloaded newer image for mcr.microsoft.com/playwright:v1.64.1-noble
2026-11-06T18:26:43.8540107Z mcr.microsoft.com/playwright:v1.64.1-noble
2026-11-06T18:26:43.8614982Z ##[command]/usr/bin/docker create --name 13d754990865429f893ebf7087123a45_mcrmicrosoftcomplaywrightv1641noble_8fc71a --label e51275 --workdir /__w/kphoto.github.io/kphoto.github.io --network github_network_287335dd884b4e42883da97d23f8b24e --init --ipc=host -e "HOME=/github/home" -e GITHUB_ACTIONS=true -e CI=true -v "/var/run/docker.sock":"/var/run/docker.sock" -v "/home/runner/work":"/__w" -v "/home/runner/actions-runner/cached/2.338.2/externals":"/__e":ro -v "/home/runner/work/_temp":"/__w/_temp" -v "/home/runner/work/_actions":"/__w/_actions" -v "/opt/hostedtoolcache":"/__t" -v "/home/runner/work/_temp/_github_home":"/github/home" -v "/home/runner/work/_temp/_github_workflow":"/github/workflow" --entrypoint "tail" mcr.microsoft.com/playwright:v1.64.1-noble "-f" "/dev/null"
2026-11-06T18:26:43.9255504Z 400f20693298101300612d0e53e9fa8e7a11dcf6f08a233872c639c7d7e45968
2026-11-06T18:26:43.9280580Z ##[command]/usr/bin/docker start 400f20693298101300612d0e53e9fa8e7a11dcf6f08a233872c639c7d7e45968
2026-11-06T18:26:44.1878660Z 400f20693298101300612d0e53e9fa8e7a11dcf6f08a233872c639c7d7e45968
2026-11-06T18:26:44.1887842Z ##[command]/usr/bin/docker ps --all --filter id=400f20693298101300612d0e53e9fa8e7a11dcf6f08a233872c639c7d7e45968 --filter status=running --no-trunc --format "{{.ID}} {{.Status}}"
2026-11-06T18:26:44.2008862Z 400f20693298101300612d0e53e9fa8e7a11dcf6f08a233872c639c7d7e45968 Up Less than a second
2026-11-06T18:26:44.2028177Z ##[command]/usr/bin/docker inspect --format "{{range .Config.Env}}{{println .}}{{end}}" 400f20693298101300612d0e53e9fa8e7a11dcf6f08a233872c639c7d7e45968
2026-11-06T18:26:44.2151775Z HOME=/github/home
2026-11-06T18:26:44.2152065Z GITHUB_ACTIONS=true
2026-11-06T18:26:44.2152246Z CI=true
2026-11-06T18:26:44.2152547Z PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
2026-11-06T18:26:44.2152980Z LANG=C.UTF-8
2026-11-06T18:26:44.2153503Z LC_ALL=C.UTF-8
2026-11-06T18:26:44.2153698Z PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
2026-11-06T18:26:44.2174418Z ##[endgroup]
2026-11-06T18:26:44.2181788Z ##[group]Waiting for all services to be ready
2026-11-06T18:26:44.2183379Z ##[endgroup]
2026-11-06T18:26:44.2412843Z ##[group]Run actions/checkout@v7
2026-11-06T18:26:44.2413276Z with:
2026-11-06T18:26:44.2413479Z   repository: kphoto/kphoto.github.io
2026-11-06T18:26:44.2415799Z   token: ***
2026-11-06T18:26:44.2415978Z   ssh-strict: true
2026-11-06T18:26:44.2416153Z   ssh-user: git
2026-11-06T18:26:44.2416327Z   persist-credentials: true
2026-11-06T18:26:44.2416523Z   clean: true
2026-11-06T18:26:44.2416702Z   sparse-checkout-cone-mode: true
2026-11-06T18:26:44.2416920Z   fetch-depth: 1
2026-11-06T18:26:44.2417088Z   fetch-tags: false
2026-11-06T18:26:44.2417260Z   show-progress: true
2026-11-06T18:26:44.2417593Z   lfs: false
2026-11-06T18:26:44.2417755Z   submodules: false
2026-11-06T18:26:44.2417927Z   set-safe-directory: true
2026-11-06T18:26:44.2418143Z   allow-unsafe-pr-checkout: false
2026-11-06T18:26:44.2418490Z env:
2026-11-06T18:26:44.2418638Z   HOME: /root
2026-11-06T18:26:44.2418798Z ##[endgroup]
2026-11-06T18:26:44.2468704Z ##[command]/usr/bin/docker exec  400f20693298101300612d0e53e9fa8e7a11dcf6f08a233872c639c7d7e45968 sh -c "cat /etc/*release | grep ^ID"
2026-11-06T18:26:44.3674830Z WARNING: Error loading config file: open /root/.docker/config.json: permission denied
2026-11-06T18:26:45.7598009Z Syncing repository: kphoto/kphoto.github.io
2026-11-06T18:26:45.7599710Z ##[group]Getting Git version info
2026-11-06T18:26:45.7600051Z Working directory is '/__w/kphoto.github.io/kphoto.github.io'
2026-11-06T18:26:45.7600550Z [command]/usr/bin/git version
2026-11-06T18:26:45.7600785Z git version 2.43.0
2026-11-06T18:26:45.7629917Z ##[endgroup]
2026-11-06T18:26:45.7639065Z Temporarily overriding HOME='/__w/_temp/4483af10-6836-4f2d-8a35-6e09216c2f2f' before making global git config changes
2026-11-06T18:26:45.7639819Z Adding repository directory to the temporary git global config as a safe directory
2026-11-06T18:26:45.7640347Z [command]/usr/bin/git config --global --add safe.directory /__w/kphoto.github.io/kphoto.github.io
2026-11-06T18:26:45.7699616Z Deleting the contents of '/__w/kphoto.github.io/kphoto.github.io'
2026-11-06T18:26:45.7708740Z ##[group]Determining repository object format
2026-11-06T18:26:45.7709268Z ##[endgroup]
2026-11-06T18:26:45.7709590Z ##[group]Initializing the repository
2026-11-06T18:26:45.7709911Z [command]/usr/bin/git init /__w/kphoto.github.io/kphoto.github.io
2026-11-06T18:26:45.7743948Z hint: Using 'master' as the name for the initial branch. This default branch name
2026-11-06T18:26:45.7744643Z hint: is subject to change. To configure the initial branch name to use in all
2026-11-06T18:26:45.7745281Z hint: of your new repositories, which will suppress this warning, call:
2026-11-06T18:26:45.7745708Z hint: 
2026-11-06T18:26:45.7746074Z hint: 	git config --global init.defaultBranch <name>
2026-11-06T18:26:45.7746470Z hint: 
2026-11-06T18:26:45.7746826Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
2026-11-06T18:26:45.7747498Z hint: 'development'. The just-created branch can be renamed via this command:
2026-11-06T18:26:45.7748173Z hint: 
2026-11-06T18:26:45.7748444Z hint: 	git branch -m <name>
2026-11-06T18:26:45.7759175Z Initialized empty Git repository in /__w/kphoto.github.io/kphoto.github.io/.git/
2026-11-06T18:26:45.7768177Z [command]/usr/bin/git remote add origin https://github.com/kphoto/kphoto.github.io
2026-11-06T18:26:45.7799322Z ##[endgroup]
2026-11-06T18:26:45.7799914Z ##[group]Disabling automatic garbage collection
2026-11-06T18:26:45.7808347Z [command]/usr/bin/git config --local gc.auto 0
2026-11-06T18:26:45.7838021Z ##[endgroup]
2026-11-06T18:26:45.7838566Z ##[group]Setting up auth
2026-11-06T18:26:45.7838913Z Removing SSH command configuration
2026-11-06T18:26:45.7839468Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2026-11-06T18:26:45.7868254Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2026-11-06T18:26:45.8844216Z Removing HTTP extra header
2026-11-06T18:26:45.8849455Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-11-06T18:26:45.8885636Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2026-11-06T18:26:45.9105238Z Removing includeIf entries pointing to credentials config files
2026-11-06T18:26:45.9116293Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-11-06T18:26:45.9142153Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
2026-11-06T18:26:45.9365701Z [command]/usr/bin/git config --file /__w/_temp/git-credentials-a8b7035f-34f4-4cc4-b15b-d10c0fecd32f.config http.https://github.com/.extraheader AUTHORIZATION: basic ***
2026-11-06T18:26:45.9406755Z [command]/usr/bin/git config --local includeIf.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git.path /__w/_temp/git-credentials-a8b7035f-34f4-4cc4-b15b-d10c0fecd32f.config
2026-11-06T18:26:45.9444220Z [command]/usr/bin/git config --local includeIf.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git/worktrees/*.path /__w/_temp/git-credentials-a8b7035f-34f4-4cc4-b15b-d10c0fecd32f.config
2026-11-06T18:26:45.9482067Z [command]/usr/bin/git config --local includeIf.gitdir:/github/workspace/.git.path /github/runner_temp/git-credentials-a8b7035f-34f4-4cc4-b15b-d10c0fecd32f.config
2026-11-06T18:26:45.9521234Z [command]/usr/bin/git config --local includeIf.gitdir:/github/workspace/.git/worktrees/*.path /github/runner_temp/git-credentials-a8b7035f-34f4-4cc4-b15b-d10c0fecd32f.config
2026-11-06T18:26:45.9557513Z ##[endgroup]
2026-11-06T18:26:45.9558031Z ##[group]Fetching the repository
2026-11-06T18:26:45.9562782Z [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +34359635f83e172bc228417c3d64dd08e503447a:refs/remotes/origin/main
2026-11-06T18:26:58.6265210Z From https://github.com/kphoto/kphoto.github.io
2026-11-06T18:26:58.6265678Z  * [new ref]         34359635f83e172bc228417c3d64dd08e503447a -> origin/main
2026-11-06T18:26:58.6289020Z [command]/usr/bin/git branch --list --remote origin/main
2026-11-06T18:26:58.6321633Z   origin/main
2026-11-06T18:26:58.6328078Z [command]/usr/bin/git rev-parse refs/remotes/origin/main
2026-11-06T18:26:58.6358432Z 34359635f83e172bc228417c3d64dd08e503447a
2026-11-06T18:26:58.6361952Z ##[endgroup]
2026-11-06T18:26:58.6362452Z ##[group]Determining the checkout info
2026-11-06T18:26:58.6364829Z ##[endgroup]
2026-11-06T18:26:58.6366209Z [command]/usr/bin/git sparse-checkout disable
2026-11-06T18:26:58.6409408Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
2026-11-06T18:26:58.6445338Z ##[group]Checking out the ref
2026-11-06T18:26:58.6448166Z [command]/usr/bin/git checkout --progress --force -B main refs/remotes/origin/main
2026-11-06T18:26:59.6785000Z Updating files:  75% (420/559)
2026-11-06T18:26:59.6785855Z Updating files:  76% (425/559)
2026-11-06T18:26:59.6789033Z Updating files:  77% (431/559)
2026-11-06T18:26:59.6791913Z Updating files:  78% (437/559)
2026-11-06T18:26:59.6795376Z Updating files:  79% (442/559)
2026-11-06T18:26:59.6798345Z Updating files:  80% (448/559)
2026-11-06T18:26:59.6801236Z Updating files:  81% (453/559)
2026-11-06T18:26:59.6817898Z Updating files:  82% (459/559)
2026-11-06T18:26:59.6818486Z Updating files:  83% (464/559)
2026-11-06T18:26:59.6819057Z Updating files:  84% (470/559)
2026-11-06T18:26:59.6819405Z Updating files:  85% (476/559)
2026-11-06T18:26:59.6819715Z Updating files:  86% (481/559)
2026-11-06T18:26:59.6829285Z Updating files:  87% (487/559)
2026-11-06T18:26:59.6830556Z Updating files:  88% (492/559)
2026-11-06T18:26:59.6830912Z Updating files:  89% (498/559)
2026-11-06T18:26:59.6831220Z Updating files:  90% (504/559)
2026-11-06T18:26:59.6831510Z Updating files:  91% (509/559)
2026-11-06T18:26:59.6832869Z Updating files:  92% (515/559)
2026-11-06T18:26:59.6835487Z Updating files:  93% (520/559)
2026-11-06T18:26:59.6838898Z Updating files:  94% (526/559)
2026-11-06T18:26:59.6841782Z Updating files:  95% (532/559)
2026-11-06T18:26:59.6844686Z Updating files:  96% (537/559)
2026-11-06T18:26:59.6847951Z Updating files:  97% (543/559)
2026-11-06T18:26:59.6851228Z Updating files:  98% (548/559)
2026-11-06T18:26:59.6856320Z Updating files:  99% (554/559)
2026-11-06T18:26:59.6856674Z Updating files: 100% (559/559)
2026-11-06T18:26:59.6857004Z Updating files: 100% (559/559), done.
2026-11-06T18:26:59.6876584Z Switched to a new branch 'main'
2026-11-06T18:26:59.6877697Z branch 'main' set up to track 'origin/main'.
2026-11-06T18:26:59.7057126Z ##[endgroup]
2026-11-06T18:26:59.7104729Z [command]/usr/bin/git log -1 --format=%H
2026-11-06T18:26:59.7140005Z 34359635f83e172bc228417c3d64dd08e503447a
2026-11-06T18:26:59.7562479Z ##[group]Run corepack enable
2026-11-06T18:26:59.7562755Z [36;1mcorepack enable[0m
2026-11-06T18:26:59.7565176Z shell: sh -e {0}
2026-11-06T18:26:59.7565357Z env:
2026-11-06T18:26:59.7565514Z   HOME: /root
2026-11-06T18:26:59.7565684Z ##[endgroup]
2026-11-06T18:26:59.7719161Z WARNING: Error loading config file: open /root/.docker/config.json: permission denied
2026-11-06T18:26:59.8022140Z /__w/_temp/158927e3-a983-4ba5-a3b2-f3ed2bd53ee8.sh: 1: corepack: not found
2026-11-06T18:26:59.8059542Z ##[error]Process completed with exit code 127.
2026-11-06T18:26:59.8191829Z Post job cleanup.
2026-11-06T18:26:59.8198573Z ##[command]/usr/bin/docker exec  400f20693298101300612d0e53e9fa8e7a11dcf6f08a233872c639c7d7e45968 sh -c "cat /etc/*release | grep ^ID"
2026-11-06T18:26:59.9635199Z WARNING: Error loading config file: open /root/.docker/config.json: permission denied
2026-11-06T18:27:00.0706846Z [command]/usr/bin/git version
2026-11-06T18:27:00.0749607Z git version 2.43.0
2026-11-06T18:27:00.0798567Z Temporarily overriding HOME='/__w/_temp/7583e032-c33b-445c-9194-b188fe7db8cc' before making global git config changes
2026-11-06T18:27:00.0800034Z Adding repository directory to the temporary git global config as a safe directory
2026-11-06T18:27:00.0808645Z [command]/usr/bin/git config --global --add safe.directory /__w/kphoto.github.io/kphoto.github.io
2026-11-06T18:27:00.0865619Z Removing SSH command configuration
2026-11-06T18:27:00.0868858Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2026-11-06T18:27:00.0918637Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2026-11-06T18:27:00.1262653Z Removing HTTP extra header
2026-11-06T18:27:00.1268304Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-11-06T18:27:00.1330003Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2026-11-06T18:27:00.1607672Z Removing includeIf entries pointing to credentials config files
2026-11-06T18:27:00.1611728Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-11-06T18:27:00.1645845Z includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git.path
2026-11-06T18:27:00.1647762Z includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git/worktrees/*.path
2026-11-06T18:27:00.1648378Z includeif.gitdir:/github/workspace/.git.path
2026-11-06T18:27:00.1648843Z includeif.gitdir:/github/workspace/.git/worktrees/*.path
2026-11-06T18:27:00.1653066Z [command]/usr/bin/git config --local --get-all includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git.path
2026-11-06T18:27:00.1683440Z /__w/_temp/git-credentials-a8b7035f-34f4-4cc4-b15b-d10c0fecd32f.config
2026-11-06T18:27:00.1694407Z [command]/usr/bin/git config --local --unset includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git.path \/__w\/_temp\/git\-credentials\-a8b7035f\-34f4\-4cc4\-b15b\-d10c0fecd32f\.config
2026-11-06T18:27:00.1734467Z [command]/usr/bin/git config --local --get-all includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git/worktrees/*.path
2026-11-06T18:27:00.1765184Z /__w/_temp/git-credentials-a8b7035f-34f4-4cc4-b15b-d10c0fecd32f.config
2026-11-06T18:27:00.1772566Z [command]/usr/bin/git config --local --unset includeif.gitdir:/__w/kphoto.github.io/kphoto.github.io/.git/worktrees/*.path \/__w\/_temp\/git\-credentials\-a8b7035f\-34f4\-4cc4\-b15b\-d10c0fecd32f\.config
2026-11-06T18:27:00.1812677Z [command]/usr/bin/git config --local --get-all includeif.gitdir:/github/workspace/.git.path
2026-11-06T18:27:00.1845115Z /github/runner_temp/git-credentials-a8b7035f-34f4-4cc4-b15b-d10c0fecd32f.config
2026-11-06T18:27:00.1853694Z [command]/usr/bin/git config --local --unset includeif.gitdir:/github/workspace/.git.path \/github\/runner_temp\/git\-credentials\-a8b7035f\-34f4\-4cc4\-b15b\-d10c0fecd32f\.config
2026-11-06T18:27:00.1895915Z [command]/usr/bin/git config --local --get-all includeif.gitdir:/github/workspace/.git/worktrees/*.path
2026-11-06T18:27:00.1930493Z /github/runner_temp/git-credentials-a8b7035f-34f4-4cc4-b15b-d10c0fecd32f.config
2026-11-06T18:27:00.1937493Z [command]/usr/bin/git config --local --unset includeif.gitdir:/github/workspace/.git/worktrees/*.path \/github\/runner_temp\/git\-credentials\-a8b7035f\-34f4\-4cc4\-b15b\-d10c0fecd32f\.config
2026-11-06T18:27:00.1979215Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
2026-11-06T18:27:00.2222513Z Removing credentials config '/__w/_temp/git-credentials-a8b7035f-34f4-4cc4-b15b-d10c0fecd32f.config'
2026-11-06T18:27:00.2378280Z Stop and remove container: 13d754990865429f893ebf7087123a45_mcrmicrosoftcomplaywrightv1641noble_8fc71a
2026-11-06T18:27:00.2382232Z ##[command]/usr/bin/docker rm --force 400f20693298101300612d0e53e9fa8e7a11dcf6f08a233872c639c7d7e45968
2026-11-06T18:27:03.5709012Z 400f20693298101300612d0e53e9fa8e7a11dcf6f08a233872c639c7d7e45968
2026-11-06T18:27:03.5738696Z Remove container network: github_network_287335dd884b4e42883da97d23f8b24e
2026-11-06T18:27:03.5742680Z ##[command]/usr/bin/docker network rm github_network_287335dd884b4e42883da97d23f8b24e
2026-11-06T18:27:03.7751338Z github_network_287335dd884b4e42883da97d23f8b24e
2026-11-06T18:27:03.7821077Z Cleaning up orphan processes
