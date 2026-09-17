/**
 * CODÉDEX ADVENTURE COMPILER — CLIENT ENGINE
 * Monaco Editor + 8-Bit Web Audio + Gamified XP + Duck Wizard AI
 */

document.addEventListener('DOMContentLoaded', () => {
    // ===== Language Configuration & Quest Scrolls =====
    const LANGUAGES = {
        c: {
            id: 'c',
            name: 'C (GCC)',
            ext: '.c',
            icon: 'fa-solid fa-c',
            monacoLang: 'c',
            template: `#include <stdio.h>

int main() {
    int num = 9;
    printf("num%d\\n", num);
    printf("num=%d\\n", num--);
    printf("now num=%d\\n", num);

    int num2 = 5;
    printf("num2=%d\\n", num2);
    printf("num2=%d\\n", ++num2);
    printf("now num2=%d\\n", num2);

    return 0;
}`
        },
        cpp: {
            id: 'cpp',
            name: 'C++ (G++)',
            ext: '.cpp',
            icon: 'fa-solid fa-c',
            monacoLang: 'cpp',
            template: `#include <iostream>
#include <vector>

int main() {
    std::cout << "Codédex C++ Online Compiler" << std::endl;
    std::vector<std::string> fruits = {"Apple", "Banana", "Cherry"};
    for (size_t i = 0; i < fruits.size(); ++i) {
        std::cout << "[" << i + 1 << "]: " << fruits[i] << std::endl;
    }
    return 0;
}`
        },
        python: {
            id: 'python',
            name: 'Python 3.11',
            ext: '.py',
            icon: 'fa-brands fa-python',
            monacoLang: 'python',
            template: `def main():
    print("Codédex Python Online Compiler")
    items = ["Data", "Algorithm", "Result"]
    print(f"Items: {', '.join(items)}")

if __name__ == "__main__":
    main()`
        },
        javascript: {
            id: 'javascript',
            name: 'JavaScript',
            ext: '.js',
            icon: 'fa-brands fa-js',
            monacoLang: 'javascript',
            template: `function main() {
    console.log("Codédex JavaScript Online Compiler");
    const languages = ["C", "C++", "Python", "JavaScript", "Go"];
    console.log(\`Supported languages: \${languages.join(", ")}\`);
}

main();`
        },
        typescript: {
            id: 'typescript',
            name: 'TypeScript',
            ext: '.ts',
            icon: 'fa-solid fa-code',
            monacoLang: 'typescript',
            template: `interface UserProfile {
    id: number;
    username: string;
    role: string;
}

const user: UserProfile = { id: 1, username: "dev_user", role: "developer" };
console.log(\`User \${user.username} (ID: \${user.id}) - Role: \${user.role}\`);`
        },
        java: {
            id: 'java',
            name: 'Java 21',
            ext: '.java',
            icon: 'fa-brands fa-java',
            monacoLang: 'java',
            template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Codédex Java 21 Online Compiler");
        int count = 10;
        System.out.println("Execution count: " + count);
    }
}`
        },
        go: {
            id: 'go',
            name: 'Go',
            ext: '.go',
            icon: 'fa-brands fa-golang',
            monacoLang: 'go',
            template: `package main

import "fmt"

func main() {
    fmt.Println("Codédex Go Online Compiler")
    fmt.Println("Runtime active and ready!")
}`
        }
    };

    // Code Snippets
    const SPELLS = [
        {
            title: "🔍 Binary Search",
            desc: "O(log N) Divide & Conquer Search",
            lang: "c",
            code: `#include <stdio.h>

int binarySearch(int items[], int size, int target) {
    int low = 0, high = size - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (items[mid] == target) return mid;
        if (items[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    int data[] = {10, 25, 40, 75, 100, 250, 500};
    int target = 100;
    int idx = binarySearch(data, 7, target);
    if (idx != -1) printf("Found %d at index %d\\n", target, idx);
    else printf("Target not found.\\n");
    return 0;
}`
        },
        {
            title: "🔢 Fibonacci Sequence",
            desc: "Generate sequence up to N elements",
            lang: "python",
            code: `def fibonacci(n):
    seq = [0, 1]
    for _ in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

print("Fibonacci Sequence (First 10 numbers):")
print(fibonacci(10))`
        },
        {
            title: "⌨️ Standard Input (Stdin)",
            desc: "Read input from stdin interactively",
            lang: "c",
            code: `#include <stdio.h>

int main() {
    int a, b;
    printf("Enter two numbers (in the Input (Stdin) tab):\\n");
    if (scanf("%d %d", &a, &b) == 2) {
        printf("Sum: %d + %d = %d\\n", a, b, a + b);
    } else {
        printf("No input received. Enter numbers in the Input (Stdin) tab.\\n");
    }
    return 0;
}`
        }
    ];

    // ===== Application State =====
    let editor = null;
    let currentLang = 'c';
    let currentTheme = localStorage.getItem('codedex_theme') || 'pixel-twilight';
    const legacyThemes = ['codedex-dark', 'codedex-meadow', 'codedex-dungeon', 'theme-gameboy', 'theme-synthwave', 'theme-lava', 'theme-lofi', 'theme-bubblegum'];
    if (legacyThemes.includes(currentTheme)) {
        currentTheme = 'pixel-twilight';
        localStorage.setItem('codedex_theme', 'pixel-twilight');
    }
    let activeTabId = 1;
    let nextTabId = 2;
    let tabs = [];
    let isExecuting = false;
    let soundEnabled = localStorage.getItem('codedex_sound') !== 'false';

    // DOM Elements
    const langDropdownBtn = document.getElementById('langDropdownBtn');
    const langDropdownWrapper = document.getElementById('langDropdownWrapper');
    const currentLangIcon = document.getElementById('currentLangIcon');
    const currentLangName = document.getElementById('currentLangName');
    const btnRun = document.getElementById('btnRun');
    const btnAiQuick = document.getElementById('btnAiQuick');
    const btnFormat = document.getElementById('btnFormat');
    const btnSound = document.getElementById('btnSound');
    const soundIcon = document.getElementById('soundIcon');
    const btnTheme = document.getElementById('btnTheme');
    const themeDropdownWrapper = document.getElementById('themeDropdownWrapper');
    const btnDownload = document.getElementById('btnDownload');
    const btnShare = document.getElementById('btnShare');
    const btnSettings = document.getElementById('btnSettings');
    const tabsList = document.getElementById('tabsList');
    const btnAddTab = document.getElementById('btnAddTab');
    const btnResetCode = document.getElementById('btnResetCode');
    const btnCopyCode = document.getElementById('btnCopyCode');
    const paneResizer = document.getElementById('paneResizer');
    const editorPane = document.querySelector('.codedex-editor-pane');
    const outputPane = document.querySelector('.codedex-output-pane');
    const consoleBody = document.getElementById('consoleBody');
    const stdinInput = document.getElementById('stdinInput');
    const stdinIndicator = document.getElementById('stdinIndicator');
    const execTimeBadge = document.getElementById('execTimeBadge');
    const execTimeVal = document.getElementById('execTimeVal');
    const statusBadge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    const btnClearOutput = document.getElementById('btnClearOutput');
    const btnCopyOutput = document.getElementById('btnCopyOutput');
    const sbReady = document.getElementById('sbReady');
    const sbLang = document.getElementById('sbLang');
    const sbCursor = document.getElementById('sbCursor');
    const sbThemeName = document.getElementById('sbThemeName');
    const toast = document.getElementById('toast');
    const aiMessages = document.getElementById('aiMessages');
    const aiPromptInput = document.getElementById('aiPromptInput');
    const btnSendAi = document.getElementById('btnSendAi');
    const sideDrawer = document.getElementById('sideDrawer');
    const drawerTitle = document.getElementById('drawerTitle');
    const drawerContent = document.getElementById('drawerContent');
    const drawerClose = document.getElementById('drawerClose');

    // ===== 8-Bit Web Audio Sound Effects Synthesizer =====
    const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;

    function playTone(freq, type, duration, delay = 0) {
        if (!soundEnabled || !audioCtx) return;
        setTimeout(() => {
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch (e) {}
        }, delay);
    }

    function playSound(name) {
        if (!soundEnabled) return;
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

        if (name === 'click') {
            playTone(800, 'square', 0.05);
        } else if (name === 'run') {
            playTone(440, 'triangle', 0.08);
            playTone(660, 'triangle', 0.08, 60);
        } else if (name === 'success') {
            // Ascending coin arpeggio
            playTone(523.25, 'square', 0.08); // C5
            playTone(659.25, 'square', 0.08, 70); // E5
            playTone(783.99, 'square', 0.08, 140); // G5
            playTone(1046.50, 'square', 0.16, 210); // C6
        } else if (name === 'error') {
            playTone(220, 'sawtooth', 0.15);
            playTone(180, 'sawtooth', 0.25, 100);
        } else if (name === 'quack') {
            playTone(600, 'triangle', 0.06);
            playTone(750, 'triangle', 0.09, 40);
            playTone(500, 'triangle', 0.12, 100);
        }
    }

    btnSound.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('codedex_sound', soundEnabled);
        soundIcon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        showToast(soundEnabled ? '8-bit Audio Enabled 🔊' : 'Audio Muted 🔇');
        if (soundEnabled) playSound('success');
    });
    soundIcon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';

    // Gamification XP removed per user request
    function addXp(amount) {}

    // ===== Initialize Monaco Editor with Custom Codédex Theme =====
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        // 🌌 Celeste Dusk (Celestial Twilight / Dreamy Violet & Starlight)
        monaco.editor.defineTheme('pixel-twilight', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'c4a7e7', fontStyle: 'bold' },
                { token: 'string', foreground: 'f6c177' },
                { token: 'number', foreground: '9ccfd8' },
                { token: 'comment', foreground: '6f6990', fontStyle: 'italic' },
                { token: 'type', foreground: 'eb6f92' },
                { token: 'function', foreground: '9ccfd8' },
                { token: 'delimiter', foreground: 'dcd8f3' }
            ],
            colors: {
                'editor.background': '#181726',
                'editor.foreground': '#dcd8f3',
                'editorLineNumber.foreground': '#4a476e',
                'editorLineNumber.activeForeground': '#f6c177',
                'editor.selectionBackground': '#312f4d',
                'editor.lineHighlightBackground': '#201f33',
                'editorGutter.background': '#141320',
                'editorCursor.foreground': '#f6c177'
            }
        });

        // 🌲 Stardew Valley (Moss Garden / Botanical Earth)
        monaco.editor.defineTheme('pixel-botanical', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: '81b29a', fontStyle: 'bold' },
                { token: 'string', foreground: 'e9c46a' },
                { token: 'number', foreground: '8ecae6' },
                { token: 'comment', foreground: '697c6f', fontStyle: 'italic' },
                { token: 'type', foreground: 'b5838d' },
                { token: 'function', foreground: '70a083' },
                { token: 'delimiter', foreground: 'e4ece6' }
            ],
            colors: {
                'editor.background': '#171e19',
                'editor.foreground': '#e4ece6',
                'editorLineNumber.foreground': '#3f5244',
                'editorLineNumber.activeForeground': '#e9c46a',
                'editor.selectionBackground': '#2a382e',
                'editor.lineHighlightBackground': '#1d2720',
                'editorGutter.background': '#121713',
                'editorCursor.foreground': '#e9c46a'
            }
        });

        // ☕ Coffee Talk (Lo-Fi Roast / Warm Espresso Café)
        monaco.editor.defineTheme('pixel-lofi', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'd4a373', fontStyle: 'bold' },
                { token: 'string', foreground: 'e9d8a6' },
                { token: 'number', foreground: '81b29a' },
                { token: 'comment', foreground: '867669', fontStyle: 'italic' },
                { token: 'type', foreground: 'b5838d' },
                { token: 'function', foreground: 'c07a60' },
                { token: 'delimiter', foreground: 'f4ebe1' }
            ],
            colors: {
                'editor.background': '#1d1715',
                'editor.foreground': '#f4ebe1',
                'editorLineNumber.foreground': '#50413a',
                'editorLineNumber.activeForeground': '#e9d8a6',
                'editor.selectionBackground': '#3b2f29',
                'editor.lineHighlightBackground': '#261f1c',
                'editorGutter.background': '#15100f',
                'editorCursor.foreground': '#e9d8a6'
            }
        });

        // 🌸 Studio Ghibli (Aesthetic Rice Linen / Sakura Light Mode)
        monaco.editor.defineTheme('pixel-sakura', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'd47a88', fontStyle: 'bold' },
                { token: 'string', foreground: 'ca8a32' },
                { token: 'number', foreground: '4d849e' },
                { token: 'comment', foreground: '9b8e85', fontStyle: 'italic' },
                { token: 'type', foreground: '9b6a9c' },
                { token: 'function', foreground: '528a70' },
                { token: 'delimiter', foreground: '342e2b' }
            ],
            colors: {
                'editor.background': '#faf6f0',
                'editor.foreground': '#342e2b',
                'editorLineNumber.foreground': '#bfb2a0',
                'editorLineNumber.activeForeground': '#342e2b',
                'editor.selectionBackground': '#e8ded1',
                'editor.lineHighlightBackground': '#f3ece2',
                'editorGutter.background': '#f4eee5',
                'editorCursor.foreground': '#d47a88'
            }
        });

        // 🔮 Hyper Light (Vapor Mirage / Synth Dusk)
        monaco.editor.defineTheme('pixel-synthdusk', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'ad88e6', fontStyle: 'bold' },
                { token: 'string', foreground: 'f4cb7e' },
                { token: 'number', foreground: '7ac5cd' },
                { token: 'comment', foreground: '756c8f', fontStyle: 'italic' },
                { token: 'type', foreground: 'e07a9b' },
                { token: 'function', foreground: '7ac5cd' },
                { token: 'delimiter', foreground: 'e9e4f5' }
            ],
            colors: {
                'editor.background': '#161426',
                'editor.foreground': '#e9e4f5',
                'editorLineNumber.foreground': '#493f77',
                'editorLineNumber.activeForeground': '#f4cb7e',
                'editor.selectionBackground': '#2f2a50',
                'editor.lineHighlightBackground': '#1e1b34',
                'editorGutter.background': '#110f1e',
                'editorCursor.foreground': '#f4cb7e'
            }
        });

        // ❄️ Nordic Fjord (Polar Aurora / Frosted Slate)
        monaco.editor.defineTheme('pixel-nordic', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: '7ec4cf', fontStyle: 'bold' },
                { token: 'string', foreground: 'e7c77c' },
                { token: 'number', foreground: '74b397' },
                { token: 'comment', foreground: '65798e', fontStyle: 'italic' },
                { token: 'type', foreground: '9d8dc7' },
                { token: 'function', foreground: '7ec4cf' },
                { token: 'delimiter', foreground: 'e2e9f0' }
            ],
            colors: {
                'editor.background': '#161d25',
                'editor.foreground': '#e2e9f0',
                'editorLineNumber.foreground': '#3b4e63',
                'editorLineNumber.activeForeground': '#e7c77c',
                'editor.selectionBackground': '#263443',
                'editor.lineHighlightBackground': '#1d2631',
                'editorGutter.background': '#11161d',
                'editorCursor.foreground': '#e7c77c'
            }
        });

        // 🕹️ Game Boy Pocket (Authentic Muted Olive 1989)
        monaco.editor.defineTheme('pixel-gameboy', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: '8bac0f', fontStyle: 'bold' },
                { token: 'string', foreground: 'cad86a' },
                { token: 'number', foreground: '7fa08d' },
                { token: 'comment', foreground: '6b7d5d', fontStyle: 'italic' },
                { token: 'type', foreground: '8bac0f' },
                { token: 'function', foreground: 'cad86a' },
                { token: 'delimiter', foreground: 'd8e6c8' }
            ],
            colors: {
                'editor.background': '#24301e',
                'editor.foreground': '#d8e6c8',
                'editorLineNumber.foreground': '#556d47',
                'editorLineNumber.activeForeground': '#cad86a',
                'editor.selectionBackground': '#35472b',
                'editor.lineHighlightBackground': '#2b3a24',
                'editorGutter.background': '#1b2416',
                'editorCursor.foreground': '#cad86a'
            }
        });

        // ===== Setup Rich Multi-Language IntelliSense & Auto-Suggestions =====
        function setupIntelliSenseCompletions() {
            const K = monaco.languages.CompletionItemKind;
            const R = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;

            function buildItems(list, range) {
                return list.map(item => ({
                    label: item.label,
                    kind: item.kind || K.Function,
                    detail: item.detail || '',
                    documentation: item.doc || item.detail || '',
                    insertText: item.insertText || item.label,
                    insertTextRules: item.snippet ? R : undefined,
                    range: range,
                    sortText: item.sortText || ('0_' + item.label)
                }));
            }

            function getDocumentSymbols(model, position) {
                const text = model.getValue();
                const matches = text.match(/[a-zA-Z_][a-zA-Z0-9_]{1,}/g) || [];
                const curWord = model.getWordUntilPosition(position).word;
                const unique = [...new Set(matches)].filter(w => w !== curWord && w.length >= 2);
                return unique.slice(0, 40).map(w => ({
                    label: w,
                    kind: K.Variable,
                    detail: 'Local Symbol',
                    insertText: w,
                    sortText: '1_' + w
                }));
            }

            // ─── C Standard Library & Keywords ────────────────────────────
            const C_LIB = [
                { label: 'printf', kind: K.Function, detail: 'int printf(const char *format, ...)', doc: 'Prints formatted string to stdout [stdio.h]', insertText: 'printf("${1:%s}\\n", ${2});', snippet: true },
                { label: 'fprintf', kind: K.Function, detail: 'int fprintf(FILE *stream, const char *format, ...)', doc: 'Prints formatted string to stream [stdio.h]', insertText: 'fprintf(${1:stderr}, "${2:%s}\\n", ${3});', snippet: true },
                { label: 'sprintf', kind: K.Function, detail: 'int sprintf(char *str, const char *format, ...)', doc: 'Prints formatted string to buffer [stdio.h]', insertText: 'sprintf(${1:buffer}, "${2:%s}", ${3});', snippet: true },
                { label: 'snprintf', kind: K.Function, detail: 'int snprintf(char *str, size_t size, const char *format, ...)', doc: 'Safely formats string to sized buffer [stdio.h]', insertText: 'snprintf(${1:buffer}, sizeof(${1:buffer}), "${2:%s}", ${3});', snippet: true },
                { label: 'vprintf', kind: K.Function, detail: 'int vprintf(const char *format, va_list ap)', insertText: 'vprintf(${1:format}, ${2:ap});', snippet: true },
                { label: 'vfprintf', kind: K.Function, detail: 'int vfprintf(FILE *stream, const char *format, va_list ap)', insertText: 'vfprintf(${1:stream}, ${2:format}, ${3:ap});', snippet: true },
                { label: 'vsprintf', kind: K.Function, detail: 'int vsprintf(char *str, const char *format, va_list ap)', insertText: 'vsprintf(${1:buffer}, ${2:format}, ${3:ap});', snippet: true },
                { label: 'vsnprintf', kind: K.Function, detail: 'int vsnprintf(char *str, size_t size, const char *format, va_list ap)', insertText: 'vsnprintf(${1:buffer}, sizeof(${1:buffer}), ${2:format}, ${3:ap});', snippet: true },
                { label: 'scanf', kind: K.Function, detail: 'int scanf(const char *format, ...)', doc: 'Reads formatted input from stdin [stdio.h]', insertText: 'scanf("${1:%d}", &${2:val});', snippet: true },
                { label: 'fscanf', kind: K.Function, detail: 'int fscanf(FILE *stream, const char *format, ...)', insertText: 'fscanf(${1:file}, "${2:%d}", &${3:val});', snippet: true },
                { label: 'sscanf', kind: K.Function, detail: 'int sscanf(const char *str, const char *format, ...)', insertText: 'sscanf(${1:str}, "${2:%d}", &${3:val});', snippet: true },
                { label: 'puts', kind: K.Function, detail: 'int puts(const char *str)', doc: 'Outputs string to stdout with newline [stdio.h]', insertText: 'puts("${1:Hello, World!}");', snippet: true },
                { label: 'fputs', kind: K.Function, detail: 'int fputs(const char *str, FILE *stream)', insertText: 'fputs("${1:text}", ${2:stdout});', snippet: true },
                { label: 'fgets', kind: K.Function, detail: 'char *fgets(char *str, int n, FILE *stream)', insertText: 'fgets(${1:buf}, sizeof(${1:buf}), ${2:stdin});', snippet: true },
                { label: 'getchar', kind: K.Function, detail: 'int getchar(void)', insertText: 'getchar()' },
                { label: 'putchar', kind: K.Function, detail: 'int putchar(int c)', insertText: 'putchar(${1:\'\\n\'});', snippet: true },
                { label: 'fopen', kind: K.Function, detail: 'FILE *fopen(const char *filename, const char *mode)', insertText: 'fopen("${1:file.txt}", "${2:r}")', snippet: true },
                { label: 'fclose', kind: K.Function, detail: 'int fclose(FILE *stream)', insertText: 'fclose(${1:fp});', snippet: true },
                { label: 'fread', kind: K.Function, detail: 'size_t fread(void *ptr, size_t size, size_t count, FILE *stream)', insertText: 'fread(${1:ptr}, sizeof(${2:int}), ${3:count}, ${4:fp});', snippet: true },
                { label: 'fwrite', kind: K.Function, detail: 'size_t fwrite(const void *ptr, size_t size, size_t count, FILE *stream)', insertText: 'fwrite(${1:ptr}, sizeof(${2:int}), ${3:count}, ${4:fp});', snippet: true },
                { label: 'isprint', kind: K.Function, detail: 'int isprint(int c) [ctype.h]', insertText: 'isprint(${1:c})', snippet: true },
                { label: 'isalpha', kind: K.Function, detail: 'int isalpha(int c) [ctype.h]', insertText: 'isalpha(${1:c})', snippet: true },
                { label: 'isdigit', kind: K.Function, detail: 'int isdigit(int c) [ctype.h]', insertText: 'isdigit(${1:c})', snippet: true },
                { label: 'isalnum', kind: K.Function, detail: 'int isalnum(int c) [ctype.h]', insertText: 'isalnum(${1:c})', snippet: true },
                { label: 'isspace', kind: K.Function, detail: 'int isspace(int c) [ctype.h]', insertText: 'isspace(${1:c})', snippet: true },
                { label: 'toupper', kind: K.Function, detail: 'int toupper(int c) [ctype.h]', insertText: 'toupper(${1:c})', snippet: true },
                { label: 'tolower', kind: K.Function, detail: 'int tolower(int c) [ctype.h]', insertText: 'tolower(${1:c})', snippet: true },
                { label: 'malloc', kind: K.Function, detail: 'void *malloc(size_t size) [stdlib.h]', insertText: '(${1:int*})malloc(${2:sizeof(int) * count});', snippet: true },
                { label: 'calloc', kind: K.Function, detail: 'void *calloc(size_t n, size_t size) [stdlib.h]', insertText: '(${1:int*})calloc(${2:count}, sizeof(${3:int}));', snippet: true },
                { label: 'realloc', kind: K.Function, detail: 'void *realloc(void *ptr, size_t size) [stdlib.h]', insertText: 'realloc(${1:ptr}, ${2:new_size});', snippet: true },
                { label: 'free', kind: K.Function, detail: 'void free(void *ptr) [stdlib.h]', insertText: 'free(${1:ptr});', snippet: true },
                { label: 'exit', kind: K.Function, detail: 'void exit(int status) [stdlib.h]', insertText: 'exit(${1:0});', snippet: true },
                { label: 'rand', kind: K.Function, detail: 'int rand(void) [stdlib.h]', insertText: 'rand()' },
                { label: 'srand', kind: K.Function, detail: 'void srand(unsigned int seed) [stdlib.h]', insertText: 'srand(${1:time(NULL)});', snippet: true },
                { label: 'qsort', kind: K.Function, detail: 'void qsort(void *base, size_t n, size_t size, cmp)', insertText: 'qsort(${1:arr}, ${2:n}, sizeof(${3:int}), ${4:cmp});', snippet: true },
                { label: 'atoi', kind: K.Function, detail: 'int atoi(const char *str) [stdlib.h]', insertText: 'atoi(${1:str})', snippet: true },
                { label: 'atof', kind: K.Function, detail: 'double atof(const char *str) [stdlib.h]', insertText: 'atof(${1:str})', snippet: true },
                { label: 'atol', kind: K.Function, detail: 'long atol(const char *str) [stdlib.h]', insertText: 'atol(${1:str})', snippet: true },
                { label: 'abs', kind: K.Function, detail: 'int abs(int x) [stdlib.h]', insertText: 'abs(${1:x})', snippet: true },
                { label: 'strlen', kind: K.Function, detail: 'size_t strlen(const char *s) [string.h]', insertText: 'strlen(${1:s})', snippet: true },
                { label: 'strcpy', kind: K.Function, detail: 'char *strcpy(char *dest, const char *src) [string.h]', insertText: 'strcpy(${1:dest}, ${2:src});', snippet: true },
                { label: 'strncpy', kind: K.Function, detail: 'char *strncpy(char *dest, const char *src, size_t n)', insertText: 'strncpy(${1:dest}, ${2:src}, ${3:n});', snippet: true },
                { label: 'strcat', kind: K.Function, detail: 'char *strcat(char *dest, const char *src) [string.h]', insertText: 'strcat(${1:dest}, ${2:src});', snippet: true },
                { label: 'strcmp', kind: K.Function, detail: 'int strcmp(const char *s1, const char *s2) [string.h]', insertText: 'strcmp(${1:s1}, ${2:s2})', snippet: true },
                { label: 'strncmp', kind: K.Function, detail: 'int strncmp(const char *s1, const char *s2, size_t n)', insertText: 'strncmp(${1:s1}, ${2:s2}, ${3:n})', snippet: true },
                { label: 'strstr', kind: K.Function, detail: 'char *strstr(const char *haystack, const char *needle)', insertText: 'strstr(${1:haystack}, ${2:needle})', snippet: true },
                { label: 'strchr', kind: K.Function, detail: 'char *strchr(const char *s, int c)', insertText: 'strchr(${1:s}, ${2:\'a\'})', snippet: true },
                { label: 'memcpy', kind: K.Function, detail: 'void *memcpy(void *dest, const void *src, size_t n)', insertText: 'memcpy(${1:dest}, ${2:src}, ${3:size});', snippet: true },
                { label: 'memset', kind: K.Function, detail: 'void *memset(void *s, int c, size_t n) [string.h]', insertText: 'memset(${1:ptr}, ${2:0}, sizeof(${1:ptr}));', snippet: true },
                { label: 'sizeof', kind: K.Keyword, detail: 'sizeof operator', insertText: 'sizeof(${1:int})', snippet: true },
                { label: 'NULL', kind: K.Constant, detail: 'NULL pointer constant', insertText: 'NULL' },
                { label: 'FILE', kind: K.TypeParameter, detail: 'FILE pointer [stdio.h]', insertText: 'FILE *${1:fp};', snippet: true },
                { label: 'size_t', kind: K.TypeParameter, detail: 'size_t integer type', insertText: 'size_t' },
                { label: 'main', kind: K.Snippet, detail: 'int main() boiler plate', insertText: 'int main() {\n\t${1}\n\treturn 0;\n}', snippet: true },
                { label: 'for', kind: K.Snippet, detail: 'for loop', insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ++${1:i}) {\n\t${3}\n}', snippet: true },
                { label: 'while', kind: K.Snippet, detail: 'while loop', insertText: 'while (${1:condition}) {\n\t${2}\n}', snippet: true },
                { label: 'if', kind: K.Snippet, detail: 'if statement', insertText: 'if (${1:condition}) {\n\t${2}\n}', snippet: true },
                { label: 'ifelse', kind: K.Snippet, detail: 'if-else statement', insertText: 'if (${1:condition}) {\n\t${2}\n} else {\n\t${3}\n}', snippet: true },
                { label: 'include_stdio', kind: K.Snippet, detail: '#include <stdio.h>', insertText: '#include <stdio.h>\n', snippet: true },
                { label: 'include_stdlib', kind: K.Snippet, detail: '#include <stdlib.h>', insertText: '#include <stdlib.h>\n', snippet: true },
                { label: 'include_string', kind: K.Snippet, detail: '#include <string.h>', insertText: '#include <string.h>\n', snippet: true },
                { label: 'include_math', kind: K.Snippet, detail: '#include <math.h>', insertText: '#include <math.h>\n', snippet: true }
            ];

            // ─── C++ Additions ────────────────────────────────────────────
            const CPP_LIB = [
                { label: 'std::cout', kind: K.Class, detail: 'std::cout << output [iostream]', insertText: 'std::cout << ${1:output} << std::endl;', snippet: true },
                { label: 'std::cin', kind: K.Class, detail: 'std::cin >> var [iostream]', insertText: 'std::cin >> ${1:var};', snippet: true },
                { label: 'std::endl', kind: K.Constant, detail: 'std::endl', insertText: 'std::endl' },
                { label: 'std::vector', kind: K.Class, detail: 'std::vector<T> [vector]', insertText: 'std::vector<${1:int}> ${2:vec};', snippet: true },
                { label: 'std::string', kind: K.Class, detail: 'std::string [string]', insertText: 'std::string ${1:str};', snippet: true },
                { label: 'std::map', kind: K.Class, detail: 'std::map<K, V> [map]', insertText: 'std::map<${1:std::string}, ${2:int}> ${3:m};', snippet: true },
                { label: 'std::unordered_map', kind: K.Class, detail: 'std::unordered_map<K, V>', insertText: 'std::unordered_map<${1:std::string}, ${2:int}> ${3:m};', snippet: true },
                { label: 'std::set', kind: K.Class, detail: 'std::set<T> [set]', insertText: 'std::set<${1:int}> ${2:s};', snippet: true },
                { label: 'std::pair', kind: K.Class, detail: 'std::pair<T1, T2>', insertText: 'std::pair<${1:int}, ${2:int}> ${3:p};', snippet: true },
                { label: 'std::sort', kind: K.Function, detail: 'std::sort(begin, end) [algorithm]', insertText: 'std::sort(${1:vec}.begin(), ${1:vec}.end());', snippet: true },
                { label: 'std::min', kind: K.Function, detail: 'std::min(a, b)', insertText: 'std::min(${1:a}, ${2:b})', snippet: true },
                { label: 'std::max', kind: K.Function, detail: 'std::max(a, b)', insertText: 'std::max(${1:a}, ${2:b})', snippet: true },
                { label: 'push_back', kind: K.Method, detail: 'vec.push_back(val)', insertText: 'push_back(${1:val});', snippet: true },
                { label: 'emplace_back', kind: K.Method, detail: 'vec.emplace_back(val)', insertText: 'emplace_back(${1:val});', snippet: true },
                { label: 'size', kind: K.Method, detail: 'container.size()', insertText: 'size()' },
                { label: 'empty', kind: K.Method, detail: 'container.empty()', insertText: 'empty()' },
                { label: 'clear', kind: K.Method, detail: 'container.clear()', insertText: 'clear();' },
                { label: 'begin', kind: K.Method, detail: 'container.begin()', insertText: 'begin()' },
                { label: 'end', kind: K.Method, detail: 'container.end()', insertText: 'end()' },
                { label: 'include_iostream', kind: K.Snippet, detail: '#include <iostream>', insertText: '#include <iostream>\n', snippet: true },
                { label: 'include_vector', kind: K.Snippet, detail: '#include <vector>', insertText: '#include <vector>\n', snippet: true },
                { label: 'include_algorithm', kind: K.Snippet, detail: '#include <algorithm>', insertText: '#include <algorithm>\n', snippet: true }
            ];

            // ─── Python Library ───────────────────────────────────────────
            const PY_LIB = [
                { label: 'print', kind: K.Function, detail: 'print(*values, sep=" ", end="\\n")', insertText: 'print(${1})', snippet: true },
                { label: 'len', kind: K.Function, detail: 'len(s) -> int', insertText: 'len(${1:obj})', snippet: true },
                { label: 'range', kind: K.Function, detail: 'range(stop) or range(start, stop[, step])', insertText: 'range(${1:stop})', snippet: true },
                { label: 'input', kind: K.Function, detail: 'input(prompt="") -> str', insertText: 'input("${1:Enter: }")', snippet: true },
                { label: 'int', kind: K.Function, detail: 'int(x=0) -> int', insertText: 'int(${1:x})', snippet: true },
                { label: 'str', kind: K.Function, detail: 'str(object="") -> str', insertText: 'str(${1:x})', snippet: true },
                { label: 'float', kind: K.Function, detail: 'float(x=0.0) -> float', insertText: 'float(${1:x})', snippet: true },
                { label: 'bool', kind: K.Function, detail: 'bool(x=False) -> bool', insertText: 'bool(${1:x})', snippet: true },
                { label: 'list', kind: K.Function, detail: 'list(iterable=()) -> list', insertText: 'list(${1:iterable})', snippet: true },
                { label: 'dict', kind: K.Function, detail: 'dict(**kwargs) -> dict', insertText: 'dict(${1})', snippet: true },
                { label: 'set', kind: K.Function, detail: 'set(iterable=()) -> set', insertText: 'set(${1:iterable})', snippet: true },
                { label: 'enumerate', kind: K.Function, detail: 'enumerate(iterable, start=0)', insertText: 'enumerate(${1:iterable})', snippet: true },
                { label: 'zip', kind: K.Function, detail: 'zip(*iterables)', insertText: 'zip(${1:iter1}, ${2:iter2})', snippet: true },
                { label: 'map', kind: K.Function, detail: 'map(func, *iterables)', insertText: 'map(${1:func}, ${2:iterable})', snippet: true },
                { label: 'filter', kind: K.Function, detail: 'filter(func, iterable)', insertText: 'filter(${1:func}, ${2:iterable})', snippet: true },
                { label: 'sorted', kind: K.Function, detail: 'sorted(iterable, key=None, reverse=False)', insertText: 'sorted(${1:iterable})', snippet: true },
                { label: 'sum', kind: K.Function, detail: 'sum(iterable, start=0)', insertText: 'sum(${1:iterable})', snippet: true },
                { label: 'min', kind: K.Function, detail: 'min(arg1, arg2, *args)', insertText: 'min(${1:a}, ${2:b})', snippet: true },
                { label: 'max', kind: K.Function, detail: 'max(arg1, arg2, *args)', insertText: 'max(${1:a}, ${2:b})', snippet: true },
                { label: 'append', kind: K.Method, detail: 'list.append(object)', insertText: 'append(${1:item})', snippet: true },
                { label: 'pop', kind: K.Method, detail: 'list.pop([index]) -> item', insertText: 'pop(${1})', snippet: true },
                { label: 'split', kind: K.Method, detail: 'str.split(sep=None)', insertText: 'split("${1: }")', snippet: true },
                { label: 'join', kind: K.Method, detail: 'str.join(iterable)', insertText: '"${1:, }".join(${2:items})', snippet: true },
                { label: 'def', kind: K.Snippet, detail: 'def function():', insertText: 'def ${1:func_name}(${2:params}):\n    ${3:pass}', snippet: true },
                { label: 'class', kind: K.Snippet, detail: 'class ClassName:', insertText: 'class ${1:ClassName}:\n    def __init__(self, ${2:args}):\n        ${3:pass}', snippet: true },
                { label: 'main', kind: K.Snippet, detail: 'if __name__ == "__main__":', insertText: 'if __name__ == "__main__":\n    ${1:main()}', snippet: true },
                { label: 'for_in', kind: K.Snippet, detail: 'for loop', insertText: 'for ${1:item} in ${2:items}:\n    ${3:pass}', snippet: true },
                { label: 'try_except', kind: K.Snippet, detail: 'try ... except', insertText: 'try:\n    ${1:pass}\nexcept Exception as e:\n    ${2:print(e)}', snippet: true }
            ];

            // ─── Java Library ─────────────────────────────────────────────
            const JAVA_LIB = [
                { label: 'System.out.println', kind: K.Method, detail: 'System.out.println(value)', insertText: 'System.out.println(${1});', snippet: true },
                { label: 'System.out.print', kind: K.Method, detail: 'System.out.print(value)', insertText: 'System.out.print(${1});', snippet: true },
                { label: 'System.out.printf', kind: K.Method, detail: 'System.out.printf(format, args)', insertText: 'System.out.printf("${1:%s}\\n", ${2});', snippet: true },
                { label: 'Scanner', kind: K.Class, detail: 'Scanner scanner = new Scanner(System.in);', insertText: 'Scanner scanner = new Scanner(System.in);' },
                { label: 'main', kind: K.Snippet, detail: 'public static void main(String[] args)', insertText: 'public static void main(String[] args) {\n    ${1}\n}', snippet: true },
                { label: 'class', kind: K.Snippet, detail: 'public class Main { ... }', insertText: 'public class ${1:Main} {\n    ${2}\n}', snippet: true }
            ];

            // ─── JavaScript / TypeScript Library ──────────────────────────
            const JS_LIB = [
                { label: 'console.log', kind: K.Function, detail: 'console.log(...data)', insertText: 'console.log(${1});', snippet: true },
                { label: 'console.error', kind: K.Function, detail: 'console.error(...data)', insertText: 'console.error(${1});', snippet: true },
                { label: 'console.warn', kind: K.Function, detail: 'console.warn(...data)', insertText: 'console.warn(${1});', snippet: true },
                { label: 'document.getElementById', kind: K.Function, detail: 'document.getElementById(id)', insertText: 'document.getElementById("${1:id}")', snippet: true },
                { label: 'document.querySelector', kind: K.Function, detail: 'document.querySelector(selector)', insertText: 'document.querySelector("${1:selector}")', snippet: true },
                { label: 'addEventListener', kind: K.Method, detail: 'target.addEventListener(type, listener)', insertText: 'addEventListener("${1:click}", (e) => {\n    ${2}\n});', snippet: true },
                { label: 'setTimeout', kind: K.Function, detail: 'setTimeout(callback, ms)', insertText: 'setTimeout(() => {\n    ${1}\n}, ${2:1000});', snippet: true },
                { label: 'JSON.stringify', kind: K.Function, detail: 'JSON.stringify(val, replacer, space)', insertText: 'JSON.stringify(${1:obj}, null, 2)', snippet: true },
                { label: 'JSON.parse', kind: K.Function, detail: 'JSON.parse(text)', insertText: 'JSON.parse(${1:jsonStr})', snippet: true }
            ];

            // ─── Go Library ───────────────────────────────────────────────
            const GO_LIB = [
                { label: 'fmt.Println', kind: K.Function, detail: 'fmt.Println(a ...any)', insertText: 'fmt.Println(${1})', snippet: true },
                { label: 'fmt.Printf', kind: K.Function, detail: 'fmt.Printf(format, a ...any)', insertText: 'fmt.Printf("${1:%v}\\n", ${2})', snippet: true },
                { label: 'fmt.Sprintf', kind: K.Function, detail: 'fmt.Sprintf(format, a ...any)', insertText: 'fmt.Sprintf("${1:%v}", ${2})', snippet: true },
                { label: 'main', kind: K.Snippet, detail: 'func main()', insertText: 'func main() {\n\t${1}\n}', snippet: true },
                { label: 'make', kind: K.Function, detail: 'make(t Type, size ...IntegerType)', insertText: 'make([]${1:int}, ${2:0})', snippet: true },
                { label: 'append', kind: K.Function, detail: 'append(slice, elems ...T)', insertText: 'append(${1:slice}, ${2:elem})', snippet: true }
            ];

            function registerProvider(langId, library) {
                monaco.languages.registerCompletionItemProvider(langId, {
                    triggerCharacters: ['.', '>', ':', '#', '(', '"', '\'', ' '],
                    provideCompletionItems: (model, position) => {
                        const word = model.getWordUntilPosition(position);
                        const range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn
                        };
                        const staticSuggs = buildItems(library, range);
                        const docSuggs = buildItems(getDocumentSymbols(model, position), range);
                        return { suggestions: [...staticSuggs, ...docSuggs] };
                    }
                });
            }

            registerProvider('c', C_LIB);
            registerProvider('cpp', [...C_LIB, ...CPP_LIB]);
            registerProvider('python', PY_LIB);
            registerProvider('java', JAVA_LIB);
            registerProvider('javascript', JS_LIB);
            registerProvider('typescript', JS_LIB);
            registerProvider('go', GO_LIB);
        }

        setupIntelliSenseCompletions();

        // Initialize First Tab & Model
        const initialCode = getSavedCode(currentLang) || LANGUAGES[currentLang].template;
        const initialModel = monaco.editor.createModel(initialCode, LANGUAGES[currentLang].monacoLang);

        tabs.push({
            id: 1,
            name: `main${LANGUAGES[currentLang].ext}`,
            lang: currentLang,
            model: initialModel
        });

        // Create Monaco Editor with Full IntelliSense / Auto-Suggest Enabled
        editor = monaco.editor.create(document.getElementById('monaco-container'), {
            model: initialModel,
            theme: currentTheme,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            fontSize: parseInt(localStorage.getItem('codedex_fontsize') || '14', 10),
            tabSize: 4,
            minimap: { enabled: localStorage.getItem('codedex_minimap') !== 'false' },
            wordWrap: localStorage.getItem('codedex_wordwrap') === 'true' ? 'on' : 'off',
            automaticLayout: true,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
            padding: { top: 14, bottom: 14 },
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            scrollBeyondLastLine: false,
            // Quick Suggestions & Autocomplete
            quickSuggestions: {
                other: true,
                comments: true,
                strings: true
            },
            quickSuggestionsDelay: 10,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            tabCompletion: "on",
            wordBasedSuggestions: "allDocuments",
            suggestSelection: "first",
            suggest: {
                snippetsPreventQuickSuggestions: false,
                localityBonus: true,
                shareSuggestSelections: true,
                showIcons: true,
                preview: true,
                insertMode: 'insert',
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showKeywords: true,
                showWords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showSnippets: true
            }
        });

        editor.onDidChangeCursorPosition(e => {
            sbCursor.textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
        });

        editor.onDidChangeModelContent(() => {
            const activeTab = tabs.find(t => t.id === activeTabId);
            if (activeTab) {
                saveCode(activeTab.lang, editor.getValue());
            }
        });

        // Shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            runCode();
        });

        editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
            formatCode();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
            editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
        });

        applyTheme(currentTheme);
        renderTabs();
        updateLanguageDisplay(currentLang);
    });

    // ===== Tab Management =====
    function renderTabs() {
        tabsList.innerHTML = '';
        tabs.forEach(tab => {
            const tabEl = document.createElement('div');
            tabEl.className = `quest-tab ${tab.id === activeTabId ? 'active' : ''}`;
            tabEl.setAttribute('data-tab-id', tab.id);

            const langInfo = LANGUAGES[tab.lang] || LANGUAGES.c;
            tabEl.innerHTML = `
                <span class="tab-badge">${tab.lang.toUpperCase()}</span>
                <span class="tab-name">${tab.name}</span>
                ${tabs.length > 1 ? '<span class="tab-close" title="Close Scroll"><i class="fa-solid fa-xmark"></i></span>' : ''}
            `;

            tabEl.addEventListener('click', (e) => {
                if (e.target.closest('.tab-close')) {
                    closeTab(tab.id);
                } else {
                    switchTab(tab.id);
                }
            });

            tabsList.appendChild(tabEl);
        });
    }

    function switchTab(tabId) {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab || !editor) return;

        activeTabId = tab.id;
        editor.setModel(tab.model);
        currentLang = tab.lang;
        updateLanguageDisplay(currentLang);
        renderTabs();
        playSound('click');
    }

    function createNewTab(lang = currentLang) {
        if (!editor) return;
        const langInfo = LANGUAGES[lang] || LANGUAGES.c;
        const id = nextTabId++;
        const name = `spell${id}${langInfo.ext}`;
        const template = getSavedCode(lang) || langInfo.template;
        const model = monaco.editor.createModel(template, langInfo.monacoLang);

        tabs.push({ id, name, lang, model });
        switchTab(id);
        playSound('click');
    }

    function closeTab(tabId) {
        if (tabs.length <= 1) return;
        const idx = tabs.findIndex(t => t.id === tabId);
        if (idx === -1) return;

        tabs[idx].model.dispose();
        tabs.splice(idx, 1);

        if (activeTabId === tabId) {
            const nextActive = tabs[Math.max(0, idx - 1)];
            switchTab(nextActive.id);
        } else {
            renderTabs();
        }
    }

    btnAddTab.addEventListener('click', () => createNewTab());

    // ===== Language Switching =====
    function switchLanguage(lang) {
        if (!LANGUAGES[lang]) return;
        currentLang = lang;

        const activeTab = tabs.find(t => t.id === activeTabId);
        if (activeTab && editor) {
            activeTab.lang = lang;
            activeTab.name = `main${LANGUAGES[lang].ext}`;
            const code = getSavedCode(lang) || LANGUAGES[lang].template;

            activeTab.model.dispose();
            activeTab.model = monaco.editor.createModel(code, LANGUAGES[lang].monacoLang);
            editor.setModel(activeTab.model);
        }

        updateLanguageDisplay(lang);
        renderTabs();
        playSound('click');
        showToast(`Equipped ${LANGUAGES[lang].name} Spell Scroll`);
    }

    function updateLanguageDisplay(lang) {
        const info = LANGUAGES[lang] || LANGUAGES.c;
        currentLangName.textContent = info.name;
        currentLangIcon.innerHTML = `<i class="${info.icon}"></i>`;
        sbLang.textContent = `📜 Spell: ${info.name}`;

        document.querySelectorAll('#langDropdownMenu .dropdown-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-lang') === lang);
        });
    }

    langDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdownWrapper.classList.toggle('open');
        themeDropdownWrapper.classList.remove('open');
        playSound('click');
    });

    document.querySelectorAll('#langDropdownMenu .dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const lang = item.getAttribute('data-lang');
            switchLanguage(lang);
            langDropdownWrapper.classList.remove('open');
        });
    });

    // Theme Switcher
    btnTheme.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdownWrapper.classList.toggle('open');
        langDropdownWrapper.classList.remove('open');
        playSound('click');
    });

    document.querySelectorAll('#themeDropdownMenu .dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const theme = item.getAttribute('data-theme');
            applyTheme(theme);
            themeDropdownWrapper.classList.remove('open');
            playSound('click');
        });
    });

    document.addEventListener('click', () => {
        langDropdownWrapper.classList.remove('open');
        themeDropdownWrapper.classList.remove('open');
    });

    function applyTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('codedex_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);

        if (editor) {
            const monacoThemeMap = {
                'pixel-twilight': 'pixel-twilight',
                'pixel-botanical': 'pixel-botanical',
                'pixel-lofi': 'pixel-lofi',
                'pixel-sakura': 'pixel-sakura',
                'pixel-synthdusk': 'pixel-synthdusk',
                'pixel-nordic': 'pixel-nordic',
                'pixel-gameboy': 'pixel-gameboy'
            };
            monaco.editor.setTheme(monacoThemeMap[theme] || 'pixel-twilight');
        }

        const themeLabels = {
            'pixel-twilight': 'Celeste Dusk',
            'pixel-botanical': 'Stardew Moss',
            'pixel-lofi': 'Coffee Talk Espresso',
            'pixel-sakura': 'Ghibli Linen (Light)',
            'pixel-synthdusk': 'Hyper Light Synth',
            'pixel-nordic': 'Nordic Aurora',
            'pixel-gameboy': 'Game Boy Pocket 1989'
        };
        sbThemeName.textContent = themeLabels[theme] || 'Celeste Dusk';

        document.querySelectorAll('#themeDropdownMenu .dropdown-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-theme') === theme);
        });
    }

    // ===== Output Tabs (Quest Log / Backpack / Duck Wizard / Trophies) =====
    document.querySelectorAll('.qtab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            document.querySelectorAll('.qtab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.quest-panel').forEach(p => p.classList.remove('active'));

            tabBtn.classList.add('active');
            const targetPane = tabBtn.getAttribute('data-pane');
            const panel = document.getElementById(`view${capitalize(targetPane)}`);
            if (panel) panel.classList.add('active');
            playSound('click');
        });
    });

    stdinInput.addEventListener('input', () => {
        stdinIndicator.style.display = stdinInput.value.trim().length > 0 ? 'inline-block' : 'none';
    });

    // ===== Code Execution =====
    async function runCode() {
        if (!editor || isExecuting) return;

        const code = editor.getValue();
        const stdin = stdinInput.value;

        // Switch to Console
        document.querySelector('.qtab[data-pane="console"]').click();

        // UI State -> Running
        isExecuting = true;
        playSound('run');
        btnRun.classList.add('running');
        btnRun.querySelector('.btn-inner').innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>RUNNING...</span>`;
        statusBadge.className = 'quest-status running';
        statusText.textContent = 'Running...';
        if (sbReady) sbReady.textContent = 'Running...';
        execTimeBadge.style.display = 'none';

        consoleBody.innerHTML = `<div class="intro-msg"><i class="fa-solid fa-spinner fa-spin out-info"></i> Compiling and executing in ${LANGUAGES[currentLang].name}...</div>`;

        try {
            // Client-side JS/TS Execution
            if (currentLang === 'javascript' || currentLang === 'typescript') {
                const startTime = performance.now();
                const logs = [];
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;

                console.log = (...args) => logs.push({ type: 'stdout', text: args.map(formatLogItem).join(' ') });
                console.error = (...args) => logs.push({ type: 'stderr', text: args.map(formatLogItem).join(' ') });
                console.warn = (...args) => logs.push({ type: 'stderr', text: args.map(formatLogItem).join(' ') });

                let success = true;
                let errorMsg = '';

                try {
                    let runStr = code;
                    if (currentLang === 'typescript') {
                        runStr = code.replace(/:\s*[A-Za-z0-9_\[\]<>{}:,\s|&]+/g, '')
                                     .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
                                     .replace(/type\s+\w+\s*=[\s\S]*?;/g, '');
                    }
                    new Function(runStr)();
                } catch (err) {
                    success = false;
                    errorMsg = err.stack || err.message;
                } finally {
                    console.log = originalLog;
                    console.error = originalError;
                    console.warn = originalWarn;
                }

                const elapsed = Math.round(performance.now() - startTime);
                renderOutput({
                    success,
                    stdout: logs.filter(l => l.type === 'stdout').map(l => l.text).join('\n') + (logs.length ? '\n' : ''),
                    stderr: errorMsg || logs.filter(l => l.type === 'stderr').map(l => l.text).join('\n'),
                    time: elapsed,
                    exitCode: success ? 0 : 1
                });
                return;
            }

            // Server-side Execution
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: currentLang,
                    code: code,
                    stdin: stdin
                })
            });

            if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
            const data = await response.json();
            renderOutput(data);

        } catch (err) {
            renderOutput({
                success: false,
                stdout: '',
                stderr: `Execution failed: ${err.message}\nMake sure your local backend server is running on http://localhost:4000.`,
                time: 0,
                exitCode: 1
            });
        } finally {
            isExecuting = false;
            btnRun.classList.remove('running');
            btnRun.querySelector('.btn-inner').innerHTML = `<i class="fa-solid fa-play"></i><span>RUN CODE</span><span class="key-hint">Ctrl+↵</span>`;
        }
    }

    function renderOutput(data) {
        consoleBody.innerHTML = '';

        if (data.stdout) {
            const outEl = document.createElement('div');
            outEl.className = 'out-success';
            outEl.textContent = data.stdout;
            consoleBody.appendChild(outEl);
        }

        if (data.stderr) {
            const errEl = document.createElement('div');
            errEl.className = 'out-error';
            errEl.textContent = data.stderr;
            consoleBody.appendChild(errEl);
        }

        if (!data.stdout && !data.stderr) {
            consoleBody.innerHTML = `<div class="intro-msg">Program finished with no output.</div>`;
        }

        if (data.success) {
            // Clear any previous error markers
            if (editor) monaco.editor.setModelMarkers(editor.getModel(), 'compiler', []);
            statusBadge.className = 'quest-status ready';
            statusBadge.innerHTML = `<span class="status-heart"><i class="fa-solid fa-circle-check"></i></span><span class="status-txt">Success</span>`;
            statusText.textContent = 'Success';
            if (sbReady) sbReady.textContent = 'Ready';
            playSound('success');
        } else {
            statusBadge.className = 'quest-status error';
            statusBadge.innerHTML = `<span class="status-heart"><i class="fa-solid fa-triangle-exclamation out-error"></i></span><span class="status-txt out-error">Compilation Error</span>`;
            if (sbReady) sbReady.textContent = 'Error';
            playSound('error');

            // Highlight error in Monaco Editor & Render Auto-Fix Banner
            let errLineNum = null;
            let errMsgText = 'Compiler Error';
            if (data.stderr) {
                const lineMatch = data.stderr.match(/(?:[a-zA-Z0-9_\-\\\/.]+):(\d+):(?:\d+:)?\s*error:\s*(.*)/i) ||
                                  data.stderr.match(/line (\d+)/i);
                if (lineMatch) {
                    errLineNum = parseInt(lineMatch[1], 10);
                    if (lineMatch[2]) errMsgText = lineMatch[2].trim();
                    if (editor && errLineNum) {
                        monaco.editor.setModelMarkers(editor.getModel(), 'compiler', [{
                            startLineNumber: errLineNum,
                            startColumn: 1,
                            endLineNumber: errLineNum,
                            endColumn: 100,
                            message: errMsgText,
                            severity: monaco.MarkerSeverity.Error
                        }]);
                        editor.revealLineInCenter(errLineNum);
                    }
                }

                // Render Interactive Auto-Fix Banner in Console
                const fixBanner = document.createElement('div');
                fixBanner.className = 'auto-fix-banner';
                fixBanner.innerHTML = `
                    <div class="auto-fix-info">
                        <div class="auto-fix-duck" style="font-size: 22px; display:flex; align-items:center; justify-content:center; width:44px; height:44px; background:rgba(255,209,102,0.15); border-radius:8px; color:var(--color-yellow);">
                            <i class="fa-solid fa-wrench"></i>
                        </div>
                        <div class="auto-fix-text">
                            <strong>⚡ AI AUTO-FIX AVAILABLE</strong>
                            <p>${errLineNum ? 'Detected error on line ' + errLineNum + ': <code>' + escapeHtml(errMsgText) + '</code>. ' : ''}Click below to automatically repair and verify your code.</p>
                        </div>
                    </div>
                    <button class="btn-auto-fix-action" id="btnAutoFixBanner">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        <span>1-CLICK AUTO-FIX CODE</span>
                    </button>
                `;
                consoleBody.appendChild(fixBanner);

                const btnFix = fixBanner.querySelector('#btnAutoFixBanner');
                btnFix.addEventListener('click', () => autoFixCode(data.stderr, fixBanner));
            }
        }

        if (data.time !== undefined) {
            execTimeBadge.style.display = 'inline-flex';
            execTimeVal.textContent = `${data.time}ms`;
        }
    }

    // ===== 1-Click Auto-Fix Engine =====
    async function autoFixCode(errorText = '', targetBanner = null) {
        if (!editor) return;
        playSound('run');
        showToast('AI is repairing your code...');

        if (targetBanner) {
            const btn = targetBanner.querySelector('#btnAutoFixBanner');
            if (btn) {
                btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>REPAIRING...</span>`;
                btn.style.pointerEvents = 'none';
            }
        }

        try {
            const geminiKey = (localStorage.getItem('codedex_gemini_key') || '').trim();
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'debug',
                    language: currentLang,
                    code: editor.getValue(),
                    error: errorText || consoleBody.textContent,
                    apiKey: geminiKey
                })
            });

            if (!response.ok) throw new Error('AI connection failed');
            const data = await response.json();

            if (data.success && data.fixedCode) {
                // Inscribe repaired code directly into Monaco Editor
                editor.setValue(data.fixedCode);
                monaco.editor.setModelMarkers(editor.getModel(), 'compiler', []);
                playSound('success');

                const issuesText = (data.issues && data.issues.length) ? data.issues.join(' ') : 'Repaired syntax and execution issues.';

                if (targetBanner) {
                    targetBanner.outerHTML = `
                        <div class="fix-success-banner">
                            <div>
                                <strong>✨ CODE REPAIRED & VERIFIED!</strong>
                                <p>${escapeHtml(issuesText)}</p>
                            </div>
                            <button class="btn-rerun-fixed" id="btnReRunFixed">
                                <i class="fa-solid fa-play"></i>
                                <span>RE-RUN CODE</span>
                            </button>
                        </div>
                    `;
                    const reRunBtn = consoleBody.querySelector('#btnReRunFixed');
                    if (reRunBtn) reRunBtn.addEventListener('click', runCode);
                }

                showToast('Code repaired and written to editor!');
            } else {
                showToast('AI could not automatically repair code.');
            }
        } catch (err) {
            showToast('Auto-Fix error: ' + err.message);
        }
    }

    // Attach Top & Tab Fix Buttons
    const btnFixTop = document.getElementById('btnFixTop');
    if (btnFixTop) btnFixTop.addEventListener('click', () => autoFixCode());

    const btnFixTab = document.getElementById('btnFixTab');
    if (btnFixTab) btnFixTab.addEventListener('click', () => autoFixCode());

    btnRun.addEventListener('click', runCode);

    // ===== Formatting =====
    async function formatCode() {
        if (!editor) return;
        playSound('click');
        showToast('Cleansing code scroll...');

        try {
            const formatAction = editor.getAction('editor.action.formatDocument');
            if (formatAction) {
                await formatAction.run();
                showToast('Code Scroll Cleansed! ✨');
                playSound('success');
                return;
            }
        } catch (e) {}

        try {
            const response = await fetch('/api/format', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: currentLang, code: editor.getValue() })
            });
            const data = await response.json();
            if (data.success && data.formatted) {
                editor.setValue(data.formatted);
                showToast('Code Scroll Cleansed! ✨');
                playSound('success');
            }
        } catch (err) {
            showToast('Formatting completed.');
        }
    }

    btnFormat.addEventListener('click', formatCode);

    // ===== Duck Wizard AI Assistant =====
    btnAiQuick.addEventListener('click', () => {
        document.querySelector('.qtab[data-pane="ai"]').click();
        playSound('click');
    });

    document.querySelectorAll('.spell-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const action = chip.getAttribute('data-action');
            triggerAiAction(action);
        });
    });

    btnSendAi.addEventListener('click', () => {
        const text = aiPromptInput.value.trim();
        if (text) {
            sendAiMessage(text);
            aiPromptInput.value = '';
        }
    });

    aiPromptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btnSendAi.click();
    });

    async function triggerAiAction(action) {
        if (!editor) return;
        document.querySelector('.qtab[data-pane="ai"]').click();
        playSound('click');

        const actionNames = {
            debug: 'Fix Bugs',
            explain: 'Explain Code',
            optimize: 'Optimize Performance',
            document: 'Add Comments',
            security: 'Security Check'
        };

        appendAiMessage('user', `Please **${actionNames[action] || action}** on my ${LANGUAGES[currentLang].name} code.`);
        await requestAiBackend(action, '');
    }

    async function sendAiMessage(prompt) {
        appendAiMessage('user', prompt);
        playSound('click');
        await requestAiBackend('chat', prompt);
    }

    async function requestAiBackend(action, prompt) {
        const loadingId = appendAiLoading();

        try {
            const geminiKey = (localStorage.getItem('codedex_gemini_key') || '').trim();
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: action,
                    language: currentLang,
                    code: editor.getValue(),
                    prompt: prompt,
                    error: consoleBody.textContent.includes('Error') ? consoleBody.textContent : '',
                    apiKey: geminiKey
                })
            });

            removeAiLoading(loadingId);

            if (!response.ok) throw new Error('AI service error');
            const data = await response.json();

            let responseText = data.response || data.summary || 'Code analyzed successfully.';
            if (data.suggestions && data.suggestions.length) {
                responseText += '\n\n**Recommendations:**\n' + data.suggestions.join('\n');
            }
            if (data.issues && data.issues.length) {
                responseText += '\n\n**Issues:**\n' + data.issues.join('\n');
            }
            if (data.breakdown && data.breakdown.length) {
                responseText += '\n\n' + data.breakdown.join('\n');
            }

            appendAiMessage('assistant', responseText, data.fixedCode);
            playSound('success');

        } catch (err) {
            removeAiLoading(loadingId);
            appendAiMessage('assistant', `AI service error: ${err.message}. Ensure the local server is running on http://localhost:4000.`);
            playSound('error');
        }
    }

    function appendAiMessage(role, text, fixedCode = null) {
        const msg = document.createElement('div');
        msg.className = `wizard-msg ${role}`;

        const avatar = role === 'user'
            ? '<i class="fa-solid fa-user" style="font-size: 16px; color: var(--color-cyan);"></i>'
            : '<div class="msg-avatar-icon" style="width:28px; height:28px; border-radius:6px; background:rgba(196,167,231,0.15); display:flex; align-items:center; justify-content:center; color:var(--color-purple);"><i class="fa-solid fa-robot"></i></div>';

        // Extract code blocks ```lang ... ```
        const codeBlocks = [];
        let parsedText = text.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (match, lang, blockContent) => {
            const idx = codeBlocks.length;
            codeBlocks.push({ lang: lang || currentLang, code: blockContent.trim() });
            return `__CODE_BLOCK_${idx}__`;
        });

        if (!fixedCode && codeBlocks.length > 0) {
            fixedCode = codeBlocks[0].code;
        }

        let formatted = escapeHtml(parsedText)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        codeBlocks.forEach((cb, idx) => {
            const blockHtml = `
                <div class="chat-code-card">
                    <div class="chat-code-header">
                        <span class="chat-code-lang">${escapeHtml(cb.lang)}</span>
                        <div class="chat-code-actions">
                            <button class="chat-code-btn copy-snippet-btn" data-code-idx="${idx}"><i class="fa-regular fa-copy"></i> Copy</button>
                            <button class="chat-code-btn apply-snippet-btn" data-code-idx="${idx}"><i class="fa-solid fa-code"></i> Apply to Editor</button>
                        </div>
                    </div>
                    <pre class="chat-code-body"><code>${escapeHtml(cb.code)}</code></pre>
                </div>
            `;
            formatted = formatted.replace(`__CODE_BLOCK_${idx}__`, blockHtml);
        });

        let actionsHtml = '';
        if (fixedCode && codeBlocks.length === 0) {
            actionsHtml = `
                <div style="margin-top: 10px;">
                    <button class="arcade-btn apply-code-btn" style="font-size: 11px; padding: 4px 10px; background: var(--color-green); color: #fff;">
                        <span><i class="fa-solid fa-code"></i> Apply to Editor</span>
                    </button>
                </div>
            `;
        }

        msg.innerHTML = `
            ${avatar}
            <div class="msg-bubble">
                <div class="bubble-speaker">${role === 'user' ? 'You' : 'AI Assistant'}</div>
                <div>${formatted}</div>
                ${actionsHtml}
            </div>
        `;

        // Attach listeners for code block action buttons
        msg.querySelectorAll('.copy-snippet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-code-idx'), 10);
                if (codeBlocks[idx]) {
                    navigator.clipboard.writeText(codeBlocks[idx].code);
                    playSound('click');
                    showToast('Snippet copied to clipboard!');
                }
            });
        });

        msg.querySelectorAll('.apply-snippet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-code-idx'), 10);
                if (codeBlocks[idx] && editor) {
                    editor.setValue(codeBlocks[idx].code);
                    playSound('success');
                    showToast('Snippet applied to editor!');
                }
            });
        });

        if (fixedCode) {
            const applyBtn = msg.querySelector('.apply-code-btn');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    editor.setValue(fixedCode);
                    playSound('success');
                    showToast('Code applied to editor!');
                });
            }
        }

        aiMessages.appendChild(msg);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    function appendAiLoading() {
        const id = 'ai_loading_' + Date.now();
        const msg = document.createElement('div');
        msg.className = 'wizard-msg assistant';
        msg.id = id;
        msg.innerHTML = `
            <div class="msg-avatar-icon" style="width:28px; height:28px; border-radius:6px; background:rgba(196,167,231,0.15); display:flex; align-items:center; justify-content:center; color:var(--color-purple);"><i class="fa-solid fa-robot"></i></div>
            <div class="msg-bubble">
                <div class="bubble-speaker">AI Assistant</div>
                <i class="fa-solid fa-spinner fa-spin out-info"></i> Analyzing code and generating response...
            </div>
        `;
        aiMessages.appendChild(msg);
        aiMessages.scrollTop = aiMessages.scrollHeight;
        return id;
    }

    function removeAiLoading(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // ===== Resizer Splitter =====
    let isDragging = false;

    paneResizer.addEventListener('mousedown', () => {
        isDragging = true;
        paneResizer.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const workspaceRect = document.querySelector('.codedex-workspace').getBoundingClientRect();
        const offsetLeft = e.clientX - workspaceRect.left - 58;
        const totalWidth = workspaceRect.width - 58;
        const pct = (offsetLeft / totalWidth) * 100;

        if (pct >= 25 && pct <= 75) {
            editorPane.style.flex = `0 0 ${pct}%`;
            outputPane.style.flex = `0 0 ${100 - pct}%`;
            if (editor) editor.layout();
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            paneResizer.classList.remove('dragging');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            if (editor) editor.layout();
        }
    });

    // ===== Side Drawer (Code Snippets) =====
    const actSnippets = document.getElementById('actSnippets');
    const actFiles = document.getElementById('actFiles');
    const actShortcuts = document.getElementById('actShortcuts');

    if (actSnippets) {
        actSnippets.addEventListener('click', () => {
            toggleSideDrawer('📝 CODE SNIPPETS', renderSnippetsList);
        });
    }

    if (actFiles) {
        actFiles.addEventListener('click', () => {
            if (sideDrawer.style.display !== 'none') {
                sideDrawer.style.display = 'none';
                if (editor) editor.layout();
            }
        });
    }

    if (actShortcuts) {
        actShortcuts.addEventListener('click', () => {
            openModal('modalShortcuts');
        });
    }

    if (drawerClose) {
        drawerClose.addEventListener('click', () => {
            sideDrawer.style.display = 'none';
            if (editor) editor.layout();
        });
    }

    function toggleSideDrawer(title, contentRenderer) {
        if (sideDrawer.style.display === 'none') {
            sideDrawer.style.display = 'flex';
            drawerTitle.textContent = title;
            contentRenderer();
            playSound('click');
        } else {
            sideDrawer.style.display = 'none';
        }
        if (editor) editor.layout();
    }

    function renderSnippetsList() {
        drawerContent.innerHTML = '';
        SPELLS.forEach(snippet => {
            const card = document.createElement('div');
            card.className = 'spell-card';
            card.innerHTML = `
                <div class="spell-title">${snippet.title}</div>
                <div class="spell-desc">${snippet.desc}</div>
            `;
            card.addEventListener('click', () => {
                switchLanguage(snippet.lang);
                if (editor) editor.setValue(snippet.code);
                showToast(`Loaded: ${snippet.title}`);
                playSound('success');
                sideDrawer.style.display = 'none';
                if (editor) editor.layout();
            });
            drawerContent.appendChild(card);
        });
    }

    // ===== Tool Buttons =====
    btnResetCode.addEventListener('click', () => {
        if (!editor) return;
        playSound('click');
        if (confirm('Reset code to default starter template?')) {
            editor.setValue(LANGUAGES[currentLang].template);
            showToast('Code reset to default starter template');
        }
    });

    btnCopyCode.addEventListener('click', () => {
        if (!editor) return;
        navigator.clipboard.writeText(editor.getValue()).then(() => {
            playSound('click');
            showToast('Code copied to clipboard!');
        });
    });

    btnClearOutput.addEventListener('click', () => {
        consoleBody.innerHTML = '<div class="intro-msg">Console output cleared.</div>';
        execTimeBadge.style.display = 'none';
        statusBadge.className = 'quest-status ready';
        statusText.textContent = 'Ready';
        playSound('click');
        showToast('Console cleared 🧹');
    });

    btnCopyOutput.addEventListener('click', () => {
        navigator.clipboard.writeText(consoleBody.textContent).then(() => {
            playSound('click');
            showToast('Console output copied to clipboard!');
        });
    });

    btnDownload.addEventListener('click', () => {
        if (!editor) return;
        const code = editor.getValue();
        const activeTab = tabs.find(t => t.id === activeTabId);
        const filename = activeTab ? activeTab.name : `main${LANGUAGES[currentLang].ext}`;
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        playSound('click');
        showToast(`Saved ${filename} 💾`);
    });

    btnShare.addEventListener('click', () => {
        if (!editor) return;
        const code = editor.getValue();
        const hash = btoa(encodeURIComponent(code));
        const shareUrl = `${window.location.origin}${window.location.pathname}#code=${hash}&lang=${currentLang}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            playSound('success');
            showToast('Shareable link copied to clipboard! 🔗');
        });
    });

    // Modals
    btnSettings.addEventListener('click', () => openModal('modalSettings'));

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close');
            closeModal(modalId);
        });
    });

    document.querySelectorAll('.retro-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });

    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('open');
            playSound('click');
        }
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('open');
    }

    // Settings Controls
    const settingFontSize = document.getElementById('settingFontSize');
    const settingSound = document.getElementById('settingSound');
    const settingMinimap = document.getElementById('settingMinimap');
    const settingWordWrap = document.getElementById('settingWordWrap');

    settingFontSize.value = localStorage.getItem('codedex_fontsize') || '14';
    settingFontSize.addEventListener('change', () => {
        const size = parseInt(settingFontSize.value, 10);
        localStorage.setItem('codedex_fontsize', size);
        if (editor) editor.updateOptions({ fontSize: size });
    });

    settingSound.checked = soundEnabled;
    settingSound.addEventListener('change', () => {
        soundEnabled = settingSound.checked;
        localStorage.setItem('codedex_sound', soundEnabled);
        soundIcon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    });

    settingMinimap.checked = localStorage.getItem('codedex_minimap') !== 'false';
    settingMinimap.addEventListener('change', () => {
        localStorage.setItem('codedex_minimap', settingMinimap.checked);
        if (editor) editor.updateOptions({ minimap: { enabled: settingMinimap.checked } });
    });

    settingWordWrap.checked = localStorage.getItem('codedex_wordwrap') === 'true';
    settingWordWrap.addEventListener('change', () => {
        localStorage.setItem('codedex_wordwrap', settingWordWrap.checked);
        if (editor) editor.updateOptions({ wordWrap: settingWordWrap.checked ? 'on' : 'off' });
    });

    // ===== Google Gemini API Key Settings & Status =====
    const settingGeminiKey = document.getElementById('settingGeminiKey');
    const btnSaveGeminiKey = document.getElementById('btnSaveGeminiKey');
    const btnToggleKeyVis = document.getElementById('btnToggleKeyVis');
    const eyeKeyIcon = document.getElementById('eyeKeyIcon');
    const btnConfigKey = document.getElementById('btnConfigKey');
    const btnConfigKeyText = document.getElementById('btnConfigKeyText');
    const aiKeyDot = document.getElementById('aiKeyDot');
    const aiKeyStatusText = document.getElementById('aiKeyStatusText');

    function updateGeminiStatusUI() {
        const key = (localStorage.getItem('codedex_gemini_key') || '').trim();
        if (settingGeminiKey) settingGeminiKey.value = key;
        if (key) {
            if (aiKeyDot) aiKeyDot.className = 'pulse-dot-ai connected';
            if (aiKeyStatusText) aiKeyStatusText.textContent = '✨ Gemini AI Connected (Cloud Intelligence)';
            if (btnConfigKeyText) btnConfigKeyText.textContent = 'Manage Key';
        } else {
            if (aiKeyDot) aiKeyDot.className = 'pulse-dot-ai';
            if (aiKeyStatusText) aiKeyStatusText.textContent = '⚡ Local AI (Add Gemini Key for Ultra Mode)';
            if (btnConfigKeyText) btnConfigKeyText.textContent = 'Add Key';
        }
    }

    if (btnSaveGeminiKey) {
        btnSaveGeminiKey.addEventListener('click', () => {
            const val = (settingGeminiKey.value || '').trim();
            localStorage.setItem('codedex_gemini_key', val);
            updateGeminiStatusUI();
            playSound('success');
            showToast(val ? 'Gemini API Key Saved! 🔑' : 'Gemini API Key Removed');
        });
    }

    if (btnToggleKeyVis) {
        btnToggleKeyVis.addEventListener('click', () => {
            if (settingGeminiKey.type === 'password') {
                settingGeminiKey.type = 'text';
                eyeKeyIcon.className = 'fa-solid fa-eye-slash';
            } else {
                settingGeminiKey.type = 'password';
                eyeKeyIcon.className = 'fa-solid fa-eye';
            }
        });
    }

    if (btnConfigKey) {
        btnConfigKey.addEventListener('click', () => {
            openModal('modalSettings');
            if (settingGeminiKey) {
                setTimeout(() => {
                    settingGeminiKey.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    settingGeminiKey.focus();
                }, 150);
            }
        });
    }

    updateGeminiStatusUI();

    // ===== Helpers =====
    function showToast(text) {
        toast.textContent = text;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2300);
    }

    function getSavedCode(lang) {
        return localStorage.getItem(`codedex_code_${lang}`);
    }

    function saveCode(lang, code) {
        localStorage.setItem(`codedex_code_${lang}`, code);
    }

    function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function formatLogItem(item) {
        if (typeof item === 'object' && item !== null) {
            try { return JSON.stringify(item, null, 2); } catch (_) { return String(item); }
        }
        return String(item);
    }

    // Load shared code from URL hash if present
    if (window.location.hash.includes('code=')) {
        try {
            const params = new URLSearchParams(window.location.hash.slice(1));
            const sharedCode = decodeURIComponent(atob(params.get('code')));
            const sharedLang = params.get('lang') || 'c';
            if (sharedCode) {
                setTimeout(() => {
                    switchLanguage(sharedLang);
                    if (editor) editor.setValue(sharedCode);
                    showToast('Loaded shared quest from link!');
                }, 300);
            }
        } catch (e) {}
    }
});
