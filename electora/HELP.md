# How to write canvas custom elements

## References

- [Pizzeria observability on Grafana Canvas panel](https://volkovlabs.io/blog/pizzeria-canvas-20230723/)
- [Grafana Developer Guide](https://github.com/grafana/grafana/blob/main/contribute/developer-guide.md)

## Prerequisites

Build on WSL only.

```shell
sudo apt install git -y
git version
#
sudo apt install golang-go
go version
#
sudo apt install nodejs npm
node --version
npm --version
#
sudo apt install build-essential
gcc --version
```

## Clone repo

```shell
git clone https://github.com/grafana/grafana.git
# make lefthook-install
# make lefthook-uninstall
cd grafana
```

## Build and run frontend

```shell
yarn install --immutable
yarn start
```

## Build and run backend

```shell
make run
```

Test by navigating to `http://localhost:3000` (admin/admin).

## Add canvas custom elements

### Modify

1. Checkout specific version: `git checkout tags/v11.5.2 -b feature/canvas-custom-elements`
2. Add new `tsx` components to `public/app/features/canvas/elements/`
3. Register components id's in `public/app/features/canvas/registry.ts`
4. Add component id's to `SVGElements` in `public/app/features/canvas/runtime/elements.tsx`

Example:

```shell
~/grafana (feature/canvas-custom-elements*) $ git status
On branch feature/canvas-custom-elements
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   public/app/features/canvas/elements/electora/achtelrund.tsx
        new file:   public/app/features/canvas/elements/electora/halbrund.tsx
        new file:   public/app/features/canvas/elements/electora/viertelrund.tsx
        new file:   public/app/features/canvas/elements/electora/waagerecht.tsx
        new file:   public/app/features/canvas/elements/electora/weiche.tsx
        modified:   public/app/features/canvas/registry.ts
        modified:   public/app/features/canvas/runtime/element.tsx
```

### Create patch

```shell
git commit -m "Electora canvas custom elements added"
git format-patch -1
#
git diff --cached > canvas-custom-elements.diff
```

### Apply patch

```shell
git apply --check 0001-Electora-canvas-custom-elements-added.patch
```

## Maintain canvas custom elements

### Eigenes Git-Repo

1. Eigenes Git-Repo zur Verwaltung der eigenen Änderungen (im `public` Ordner) zu verwalten.
2. Erstelle ein benutzerdefiniertes Dockerfile, das auf dem offiziellen Grafana-Image basiert.

   ```Dockerfile
   FROM grafana/grafana:latest
   COPY custom-files/ /usr/share/grafana/public
   ```

3. GitLab CI, um Ihr angepasstes Image automatisch zu bauen und zu aktualisieren, wenn sich entweder das offizielle
   Grafana-Image oder Ihre Anpassungen ändern.

### Git-Patch

...

###

```shell
export GRAFANA_VERSION=11.5.2
#
git clone https://github.com/grafana/grafana.git
cd grafana
#
git checkout tags/v${GRAFANA_VERSION}
#
git apply grafana-electora.patch
#
cd packaging/docker/custom
docker build \
  --build-arg "GRAFANA_VERSION=${GRAFANA_VERSION}" \
  -t grafana-electora:${GRAFANA_VERSION} .
```

###

```Dockerfile
FROM grafana/grafana:latest

COPY grafana-electora.patch /tmp/

RUN apk add --no-cache git && \
git apply /tmp/grafana-electora.patch && \
apk del git
```

```shell
docker build \
  --build-arg "GRAFANA_VERSION=${GRAFANA_VERSION}" \
-t grafana-electora -f Dockerfile
```

###

~/grafana (main) $ git checkout v11.5.2
Note: switching to 'v11.5.2'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

git switch -c <new-branch-name>

Or undo this operation with:

git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 598e0338d53 apply security patch: release-11.5.2/317-202502130459.patch
