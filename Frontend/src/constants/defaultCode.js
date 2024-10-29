export const defaultCode = {
   javascript: `function greeting(name) {\n\tconsole.log('Hello ' + name + ', Good morning');\n}\n\ngreeting('Sameen K A');`,
   python: `def greeting(name):\n\tprint('Hello',name,', Good morning')\n\ngreeting('Sameen K A')`,
   ruby: `def greeting(name)\n\tputs "Hello #{name}, Good morning"\nend\n\ngreeting('Sameen K A')`,
   java: `public class Greeting {\n\tpublic static void greeting(String name) {\n\t\tSystem.out.println("Hello " + name + ", Good morning");\n\t}\n\t\n\tpublic static void main(String[] args) {\n\t\tgreeting("Sameen K A");\n\t}\n}`,
   go: `package main\n\nimport "fmt"\n\nfunc greeting(name string) {\n\tfmt.Println("Hello " + name + ", Good morning")\n}\n\nfunc main() {\n\tgreeting("Sameen K A")\n}`,
};